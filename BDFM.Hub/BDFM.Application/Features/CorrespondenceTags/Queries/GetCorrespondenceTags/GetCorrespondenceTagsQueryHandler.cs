using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondenceTags
{
    public class GetCorrespondenceTagsQueryHandler : GetAllHandler<CorrespondenceTag, CorrespondenceTagViewModel, GetCorrespondenceTagsQuery>, IRequestHandler<GetCorrespondenceTagsQuery, Response<IEnumerable<CorrespondenceTagViewModel>>>
    {
        public GetCorrespondenceTagsQueryHandler(IBaseRepository<CorrespondenceTag> repository) : base(repository)
        {
        }

        public override Expression<Func<CorrespondenceTag, CorrespondenceTagViewModel>> Selector => ct => new CorrespondenceTagViewModel
        {
            Id = ct.Id,
            TagId = ct.TagId,
            TagName = ct.Tag.Name,
            TagDescription = ct.Tag.Description,
            TagColor = ct.Tag.Color,
            TagCategory = ct.Tag.Category,
            TagCategoryName = ct.Tag.Category.ToString(),
            IsSystemTag = ct.Tag.IsSystemTag,
            IsPrivateTag = ct.IsPrivateTag,
            Notes = ct.Notes,
            Priority = ct.Priority,
            AppliedByUserName = ct.AppliedByUser.FullName,
            AppliedAt = ct.CreateAt
        };

        public override Func<IQueryable<CorrespondenceTag>, IOrderedQueryable<CorrespondenceTag>> OrderBy => q => q.OrderBy(ct => ct.Tag.Category).ThenBy(ct => ct.Priority).ThenBy(ct => ct.Tag.Name);

        public async Task<Response<IEnumerable<CorrespondenceTagViewModel>>> Handle(GetCorrespondenceTagsQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();

            // Apply filters
            query = query.Where(ct => ct.CorrespondenceId == request.CorrespondenceId && !ct.IsDeleted);

            // Handle private tags filtering
            if (!request.IncludePrivateTags || !request.UserId.HasValue)
            {
                query = query.Where(ct => !ct.IsPrivateTag);
            }
            else if (request.IncludePrivateTags && request.UserId.HasValue)
            {
                query = query.Where(ct => !ct.IsPrivateTag || ct.AppliedByUserId == request.UserId.Value);
            }

            // Include related entities
            query = query.Include(ct => ct.Tag)
                         .Include(ct => ct.AppliedByUser);

            // Apply ordering and get results
            var result = await query
                .OrderBy(ct => ct.Tag.Category)
                .ThenBy(ct => ct.Priority)
                .ThenBy(ct => ct.Tag.Name)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<IEnumerable<CorrespondenceTagViewModel>>(null!);

            return SuccessMessage.Get.ToSuccessMessage(result.AsEnumerable());
        }
    }
}
