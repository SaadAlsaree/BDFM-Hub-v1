using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondencesWithTags;

public class GetCorrespondencesWithTagsQuery : IRequest<Response<PagedResult<CorrespondenceWithTagsVm>>>, IPaginationQuery
{
    // Pagination parameters
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;

    // Optional filtering parameters
    public string? MailNum { get; set; } = string.Empty;
    public TagCategoryEnum? Category { get; set; }
    public string? SearchTerm { get; set; }
}
