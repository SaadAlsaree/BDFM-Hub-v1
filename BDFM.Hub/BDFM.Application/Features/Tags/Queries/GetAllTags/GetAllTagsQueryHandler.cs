using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Queries.GetAllTags
{
    public class GetAllTagsQueryHandler : GetAllWithCountHandler<Tag, TagListViewModel, GetAllTagsQuery>, IRequestHandler<GetAllTagsQuery, Response<PagedResult<TagListViewModel>>>
    {
        public GetAllTagsQueryHandler(IBaseRepository<Tag> repository) : base(repository)
        {
        }

        public override Expression<Func<Tag, TagListViewModel>> Selector => t => new TagListViewModel
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Color = t.Color,
            Category = t.Category,
            CategoryName = t.Category.ToString(),
            IsSystemTag = t.IsSystemTag,
            IsPublic = t.IsPublic,
            UsageCount = t.UsageCount,
            CreatedByUserName = t.CreatedByUser != null ? t.CreatedByUser.FullName : null,
            OrganizationalUnitName = t.OrganizationalUnit != null ? t.OrganizationalUnit.UnitName : null,
            CreateAt = t.CreateAt,
            StatusName = t.StatusId.ToString()
        };

        public override Func<IQueryable<Tag>, IOrderedQueryable<Tag>> OrderBy => q => q.OrderBy(t => t.Category).ThenBy(t => t.Name);

        public async Task<Response<PagedResult<TagListViewModel>>> Handle(GetAllTagsQuery request, CancellationToken cancellationToken)
        {
            var query = _repository.Query();

            // Apply filters
            query = query.Where(t => !t.IsDeleted);

            if (request.Category.HasValue)
            {
                query = query.Where(t => t.Category == request.Category.Value);
            }

            if (request.IsPublic.HasValue)
            {
                query = query.Where(t => t.IsPublic == request.IsPublic.Value);
            }

            if (request.IsSystemTag.HasValue)
            {
                query = query.Where(t => t.IsSystemTag == request.IsSystemTag.Value);
            }

            if (request.CreatedByUserId.HasValue)
            {
                query = query.Where(t => t.CreatedByUserId == request.CreatedByUserId.Value);
            }

            if (request.OrganizationalUnitId.HasValue)
            {
                query = query.Where(t => t.OrganizationalUnitId == request.OrganizationalUnitId.Value);
            }

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(t =>
                    t.Name.ToLower().Contains(searchTerm) ||
                    (t.Description != null && t.Description.ToLower().Contains(searchTerm)));
            }

            // Get count before pagination and includes (for performance)
            var count = await query.CountAsync(cancellationToken);

            // Include related entities
            query = query.Include(t => t.CreatedByUser)
                         .Include(t => t.OrganizationalUnit);

            // Apply ordering
            if (request.OrderByUsage)
            {
                query = query.OrderByDescending(t => t.UsageCount).ThenBy(t => t.Name);
            }
            else
            {
                query = query.OrderBy(t => t.Category).ThenBy(t => t.Name);
            }

            // Apply pagination and get results
            var result = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            if (!result.Any())
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<TagListViewModel>>(null!);

            // Set StatusName for each tag (StatusName is already set in the Selector as StatusId.ToString())

            var pagedResult = new PagedResult<TagListViewModel>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
