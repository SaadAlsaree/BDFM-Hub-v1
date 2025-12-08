using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetOutgoingInternal;

public class GetOutgoingInternalQuery : IRequest<Response<PagedResult<OutgoingInternalVm>>>, IPaginationQuery
{
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public DateOnly? MailDate { get; set; }
    public string? SearchTerm { get; set; }
    public string? MailNum { get; set; }
}

public static class GetOutgoingInternalQueryExtensions
{
    public static IQueryable<Correspondence> ApplyFilterOutgoingInternal(this IQueryable<Correspondence> query, GetOutgoingInternalQuery request)
    {
        var filteredQuery = query.Where(x => !x.IsDeleted && x.CorrespondenceType == CorrespondenceTypeEnum.OutgoingInternal);

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || x.BodyText!.Contains(request.SearchTerm));
        }

        if (!string.IsNullOrEmpty(request.MailNum))
        {
            filteredQuery = filteredQuery.Where(x => x.MailNum.Contains(request.MailNum));
        }

        if (request.MailDate.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.MailDate >= request.MailDate.Value);
        }

        return filteredQuery;
    }
}
