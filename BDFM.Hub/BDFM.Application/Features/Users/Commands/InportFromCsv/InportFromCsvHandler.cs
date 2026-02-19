using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Commands.InportFromCsv;

public class ImportFromCsvHandler : IRequestHandler<ImportFromCsvCommand, Response<ImportFromCsvResponse>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly ILogger<ImportFromCsvHandler> _logger;

    public ImportFromCsvHandler(
        IBaseRepository<User> userRepository,
        ILogger<ImportFromCsvHandler> logger)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Response<ImportFromCsvResponse>> Handle(ImportFromCsvCommand request, CancellationToken cancellationToken)
    {
        var response = new ImportFromCsvResponse();
        var usersToCreate = new List<User>();

        // Parse the CSV file
        var csvRows = await ParseCsvFileAsync(request.File, cancellationToken);
        response.TotalRows = csvRows.Count;

        // Get existing logins/emails for duplicate checking
        var existingUsers = await _userRepository.GetAsync(
            filter: u => !u.IsDeleted);
        var existingLogins = existingUsers.Select(u => u.UserLogin.ToLowerInvariant()).ToHashSet();
        var existingEmails = existingUsers
            .Where(u => !string.IsNullOrEmpty(u.Email))
            .Select(u => u.Email!.ToLowerInvariant())
            .ToHashSet();

        // Also track logins within the current batch to avoid duplicates in the same file
        var batchLogins = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        for (int i = 0; i < csvRows.Count; i++)
        {
            var row = csvRows[i];
            var rowNumber = i + 1;

            // Validate row has 3 columns
            var columns = row.Split(',');
            if (columns.Length < 3)
            {
                response.Errors.Add($"سطر {rowNumber}: يجب أن يحتوي على 3 أعمدة (البريد الإلكتروني, الاسم, كلمة المرور)");
                continue;
            }

            var email = columns[0].Trim();
            var name = columns[1].Trim();
            var password = columns[2].Trim();

            // Validate required fields
            if (string.IsNullOrWhiteSpace(email))
            {
                response.Errors.Add($"سطر {rowNumber}: البريد الإلكتروني مطلوب");
                continue;
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                response.Errors.Add($"سطر {rowNumber}: الاسم مطلوب");
                continue;
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                response.Errors.Add($"سطر {rowNumber}: كلمة المرور مطلوبة");
                continue;
            }

            // Check for duplicates in DB
            if (existingLogins.Contains(email.ToLowerInvariant()))
            {
                response.Errors.Add($"سطر {rowNumber}: المستخدم '{email}' موجود مسبقاً");
                continue;
            }

            if (existingEmails.Contains(email.ToLowerInvariant()))
            {
                response.Errors.Add($"سطر {rowNumber}: البريد الإلكتروني '{email}' مستخدم مسبقاً");
                continue;
            }

            // Check for duplicates within the batch
            if (!batchLogins.Add(email))
            {
                response.Errors.Add($"سطر {rowNumber}: المستخدم '{email}' مكرر في الملف");
                continue;
            }

            // Create user entity
            var user = new User
            {
                Id = Guid.NewGuid(),
                UserLogin = email,
                Email = email,
                Username = name,
                FullName = name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                IsActive = true,
                IsDefaultPassword = true,
                IsDeleted = false,
                StatusId = Status.Active,
                CreateAt = DateTime.UtcNow,
                TwoFactorSecret = string.Empty
            };

            usersToCreate.Add(user);
        }

        // Bulk insert valid users
        if (usersToCreate.Any())
        {
            try
            {
                var created = await _userRepository.CreateRange(usersToCreate, cancellationToken: cancellationToken);
                if (created)
                {
                    response.SuccessCount = usersToCreate.Count;
                    _logger.LogInformation("تم استيراد {Count} مستخدم بنجاح من ملف CSV", usersToCreate.Count);
                }
                else
                {
                    response.Errors.Add("فشل في حفظ المستخدمين في قاعدة البيانات");
                    _logger.LogError("فشل في حفظ المستخدمين في قاعدة البيانات أثناء الاستيراد من CSV");
                }
            }
            catch (Exception ex)
            {
                response.Errors.Add($"خطأ أثناء حفظ البيانات: {ex.Message}");
                _logger.LogError(ex, "خطأ أثناء حفظ المستخدمين في قاعدة البيانات");
            }
        }

        response.FailedCount = response.TotalRows - response.SuccessCount;

        if (response.Errors.Any())
            return Response<ImportFromCsvResponse>.Success(response, new MessageResponse
            {
                Code = "ImportPartial",
                Message = $"تم استيراد {response.SuccessCount} من {response.TotalRows} مستخدم"
            });

        return Response<ImportFromCsvResponse>.Success(response, new MessageResponse
        {
            Code = "ImportSuccess",
            Message = $"تم استيراد جميع المستخدمين بنجاح ({response.SuccessCount})"
        });
    }

    private static async Task<List<string>> ParseCsvFileAsync(Microsoft.AspNetCore.Http.IFormFile file, CancellationToken cancellationToken)
    {
        var rows = new List<string>();

        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var line = await reader.ReadLineAsync(cancellationToken);
            if (!string.IsNullOrWhiteSpace(line))
                rows.Add(line.Trim());
        }

        return rows;
    }
}
