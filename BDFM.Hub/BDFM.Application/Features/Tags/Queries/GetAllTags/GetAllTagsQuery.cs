using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Application.Helper.Pagination;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Queries.GetAllTags
{
    public class GetAllTagsQuery : PaginationQuery, IRequest<Response<PagedResult<TagListViewModel>>>
    {
        public TagCategoryEnum? Category { get; set; }
        public bool? IsPublic { get; set; }
        public bool? IsSystemTag { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public Guid? OrganizationalUnitId { get; set; }
        public string? SearchTerm { get; set; }
        public bool OrderByUsage { get; set; } = false;
    }
}
