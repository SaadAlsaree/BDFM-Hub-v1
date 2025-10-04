using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Helper;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Commands.CreateInternalMail;

/// <summary>
/// Secure version of CreateInternalMailHandler with permission validation
/// </summary>
public class SecureCreateInternalMailHandler : IRequestHandler<CreateInternalMailCommand, Response<Guid>>
{
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPermissionValidationService _permissionValidationService;
    private readonly ILogger<SecureCreateInternalMailHandler> _logger;
    private readonly IMailNumberGenerator _mailNumberGenerator;

    // Permission constants
    private const string PERMISSION_CREATE_INTERNAL_MAIL = "Correspondence|CreateInternalMail";
    private const string PERMISSION_CREATE_CORRESPONDENCE = "Correspondence|Create";

    public SecureCreateInternalMailHandler(
        IBaseRepository<Correspondence> correspondenceRepository,
        ICurrentUserService currentUserService,
        IPermissionValidationService permissionValidationService,
        ILogger<SecureCreateInternalMailHandler> logger,
        IMailNumberGenerator mailNumberGenerator)
    {
        _correspondenceRepository = correspondenceRepository ?? throw new ArgumentNullException(nameof(correspondenceRepository));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _permissionValidationService = permissionValidationService ?? throw new ArgumentNullException(nameof(permissionValidationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mailNumberGenerator = mailNumberGenerator ?? throw new ArgumentNullException(nameof(mailNumberGenerator));
    }

    public async Task<Response<Guid>> Handle(CreateInternalMailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Validate permissions - user needs either specific permission or general create permission
            var requiredPermissions = new[]
            {
                PERMISSION_CREATE_INTERNAL_MAIL,
                PERMISSION_CREATE_CORRESPONDENCE
            };

            var hasPermission = await _permissionValidationService.HasAnyPermissionAsync(requiredPermissions, cancellationToken);

            if (!hasPermission)
            {
                _logger.LogWarning("User {UserId} attempted to create internal mail without required permissions",
                    _currentUserService.UserId);

                return Response<Guid>.Fail(
                    new List<object> { "Unauthorized access" },
                    new MessageResponse { Code = "Error403", Message = "Access denied. You do not have permission to create internal mail." });
            }

            _logger.LogDebug("Permission validation successful for user {UserId} creating internal mail",
                _currentUserService.UserId);

            // 2. Validate business rules
            if (string.IsNullOrWhiteSpace(request.Subject))
            {
                return Response<Guid>.Fail(
                    new List<object> { "Subject is required" },
                    new MessageResponse { Code = "Error401", Message = "Subject is required for internal mail." });
            }

            // 3. Create the correspondence entity
            var correspondence = new Correspondence
            {
                Id = Guid.NewGuid(),
                Subject = request.Subject,
                BodyText = request.BodyText,
                MailNum = _mailNumberGenerator.GetUniqueMailNumber(),
                MailDate = request.MailDate,
                SecrecyLevel = request.SecrecyLevel,
                PriorityLevel = request.PriorityLevel,
                PersonalityLevel = request.PersonalityLevel,
                CorrespondenceType = CorrespondenceTypeEnum.IncomingInternal,
                IsDraft = false,
                CreateAt = DateTime.UtcNow,
                CreateBy = _currentUserService.UserId,
                CreateByUserId = _currentUserService.UserId,
                StatusId = Status.Unverified
            };

            // 4. Save to database
            var savedCorrespondence = await _correspondenceRepository.Create(correspondence, cancellationToken);

            if (savedCorrespondence == null)
            {
                _logger.LogError("Failed to create internal mail for user {UserId}", _currentUserService.UserId);
                return Response<Guid>.Fail(
                    new List<object> { "Creation failed" },
                    new MessageResponse { Code = "Error500", Message = "Failed to create internal mail." });
            }

            _logger.LogInformation("User {UserId} successfully created internal mail with ID {CorrespondenceId}",
                _currentUserService.UserId, savedCorrespondence.Id);

            return Response<Guid>.Success(savedCorrespondence.Id,
                new MessageResponse { Code = "Success", Message = "Internal mail created successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt by user {UserId}", _currentUserService.UserId);
            return Response<Guid>.Fail(
                new List<object> { "Unauthorized access" },
                new MessageResponse { Code = "Error403", Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating internal mail for user {UserId}", _currentUserService.UserId);
            return Response<Guid>.Fail(
                new List<object> { "Internal server error" },
                new MessageResponse { Code = "Error500", Message = "An error occurred while creating the internal mail." });
        }
    }
}
