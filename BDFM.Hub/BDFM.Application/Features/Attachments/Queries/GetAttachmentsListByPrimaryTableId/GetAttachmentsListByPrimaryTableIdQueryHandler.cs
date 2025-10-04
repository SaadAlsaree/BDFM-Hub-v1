using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsListByPrimaryTableId
{
    public class GetAttachmentsListByPrimaryTableIdQueryHandler :
        IRequestHandler<GetAttachmentsListByPrimaryTableIdQuery, Response<PagedResult<AttachmentListByTableViewModel>>>
    {
        private readonly IBaseRepository<Attachment> _repository;
        private readonly IBaseRepository<User> _userRepository;

        public GetAttachmentsListByPrimaryTableIdQueryHandler(IBaseRepository<Attachment> repository, IBaseRepository<User> userRepository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        }

        public async Task<Response<PagedResult<AttachmentListByTableViewModel>>> Handle(GetAttachmentsListByPrimaryTableIdQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();

            // Apply base filters
            query = query.Where(a =>
                !a.IsDeleted &&
                a.PrimaryTableId == request.PrimaryTableId &&
                a.TableName == request.TableName);

            // Apply additional filters
            query = ApplyFilters(query, request);

            // Get total count before pagination
            var count = await query.CountAsync(cancellationToken);

            // Apply pagination and get results
            var result = await query
                .OrderByDescending(a => a.CreateAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(a => new AttachmentListByTableViewModel
                {
                    Id = a.Id,
                    Description = a.Description,
                    FileName = a.FileName,
                    FileExtension = a.FileExtension,
                    FileSize = a.FileSize,
                    Status = (int)a.StatusId,
                    CreateAt = a.CreateAt,
                    CreateBy = a.CreateBy,
                    LastUpdateAt = a.LastUpdateAt,
                    HasOcrText = !string.IsNullOrEmpty(a.OcrText),
                    CreateByName = string.Empty, // Will be populated after query execution
                    LastUpdateByName = string.Empty // Will be populated after query execution
                })
                .ToListAsync(cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<AttachmentListByTableViewModel>>(null!);

            // Set computed properties after query execution
            var allUserIds = result.SelectMany(x => new[] { x.CreateBy }).Where(id => id.HasValue).Select(id => id.Value).Distinct().ToList();
            var users = await _userRepository.Query()
                .Where(u => allUserIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName })
                .ToListAsync(cancellationToken);

            result.ToList().ForEach(x =>
            {
                x.StatusName = ((Status)x.Status).GetDisplayName();
                x.FileSizeDisplay = FormatFileSize(x.FileSize);
                x.CreateByName = users.FirstOrDefault(u => u.Id == x.CreateBy)?.FullName ?? string.Empty;
            });

            var pagedResult = new PagedResult<AttachmentListByTableViewModel>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }

        private IQueryable<Attachment> ApplyFilters(IQueryable<Attachment> query, GetAttachmentsListByPrimaryTableIdQuery request)
        {
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(a =>
                    (a.FileName != null && a.FileName.ToLower().Contains(searchTerm)) ||
                    (a.Description != null && a.Description.ToLower().Contains(searchTerm)) ||
                    (a.FileExtension != null && a.FileExtension.ToLower().Contains(searchTerm)));
            }

            if (request.StatusId.HasValue)
            {
                query = query.Where(a => (int)a.StatusId == request.StatusId.Value);
            }

            if (!string.IsNullOrEmpty(request.FileExtension))
            {
                query = query.Where(a => a.FileExtension == request.FileExtension);
            }

            return query;
        }

        private static string FormatFileSize(long? fileSizeInBytes)
        {
            if (!fileSizeInBytes.HasValue || fileSizeInBytes.Value <= 0)
                return "Unknown";

            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double fileSize = fileSizeInBytes.Value;
            int order = 0;

            while (fileSize >= 1024 && order < sizes.Length - 1)
            {
                order++;
                fileSize = fileSize / 1024;
            }

            return $"{fileSize:0.##} {sizes[order]}";
        }
    }
}
