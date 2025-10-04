using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsList
{
    public class GetAttachmentsListQueryHandler :
        GetAllWithCountHandler<Attachment, AttachmentListViewModel, GetAttachmentsListQuery>,
        IRequestHandler<GetAttachmentsListQuery, Response<PagedResult<AttachmentListViewModel>>>
    {
        private readonly IBaseRepository<User> _userRepository;
        public GetAttachmentsListQueryHandler(IBaseRepository<Attachment> repository, IBaseRepository<User> userRepository) : base(repository)
        {
            _userRepository = userRepository;
        }

        public override Expression<Func<Attachment, AttachmentListViewModel>> Selector => a => new AttachmentListViewModel
        {
            Id = a.Id,
            PrimaryTableId = a.PrimaryTableId,
            TableName = a.TableName,
            TableNameDisplay = a.TableName.GetDisplayName(),
            Description = a.Description,
            FileName = a.FileName,
            FileExtension = a.FileExtension,
            FileSize = a.FileSize,
            Status = (int)a.StatusId,
            StatusName = a.StatusId.GetDisplayName(),
            CreateAt = a.CreateAt,
            CreateBy = a.CreateBy,
            CreateByName = string.Empty // Will be populated after query execution
        };

        public override Func<IQueryable<Attachment>, IOrderedQueryable<Attachment>> OrderBy =>
            query => query.OrderByDescending(a => a.CreateAt);

        public async Task<Response<PagedResult<AttachmentListViewModel>>> Handle(GetAttachmentsListQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();

            // Apply filters
            query = ApplyFilters(query, request);

            // Apply pagination and get results
            var result = await query
                .OrderByDescending(a => a.CreateAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            var count = await query.CountAsync(cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<AttachmentListViewModel>>(null!);

            // Set StatusName and CreateByName for each item
            var userIds = result.Select(x => x.CreateBy).Distinct().ToList();
            var users = await _userRepository.Query()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName })
                .ToListAsync(cancellationToken);

            result.ToList().ForEach(x =>
            {
                x.StatusName = ((Status)x.Status).GetDisplayName();
                x.TableNameDisplay = x.TableName.GetDisplayName();
                x.CreateByName = users.FirstOrDefault(u => u.Id == x.CreateBy)?.FullName ?? string.Empty;
            });

            var pagedResult = new PagedResult<AttachmentListViewModel>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }

        private IQueryable<Attachment> ApplyFilters(IQueryable<Attachment> query, GetAttachmentsListQuery request)
        {
            // Base filter for non-deleted records
            query = query.Where(a => !a.IsDeleted);

            if (request.PrimaryTableId.HasValue)
            {
                query = query.Where(a => a.PrimaryTableId == request.PrimaryTableId.Value);
            }

            if (request.TableName.HasValue)
            {
                query = query.Where(a => a.TableName == request.TableName.Value);
            }

            if (request.StatusId.HasValue)
            {
                query = query.Where(a => (int)a.StatusId == request.StatusId.Value);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(a => a.CreateAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                var endDate = request.ToDate.Value.AddDays(1).AddSeconds(-1);
                query = query.Where(a => a.CreateAt <= endDate);
            }

            if (!string.IsNullOrEmpty(request.FileExtension))
            {
                query = query.Where(a => a.FileExtension == request.FileExtension);
            }

            return query;
        }
    }
}
