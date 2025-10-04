using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitList;

public class GetOrganizationalUnitListQueryHandler :
    GetAllWithCountHandler<OrganizationalUnit, OrganizationalUnitListViewModel, GetOrganizationalUnitListQuery>,
    IRequestHandler<GetOrganizationalUnitListQuery, Response<PagedResult<OrganizationalUnitListViewModel>>>
{
    public GetOrganizationalUnitListQueryHandler(IBaseRepository<OrganizationalUnit> repository)
        : base(repository)
    {
    }

    public override Expression<Func<OrganizationalUnit, OrganizationalUnitListViewModel>> Selector =>
        e => new OrganizationalUnitListViewModel
        {
            Id = e.Id,
            UnitName = e.UnitName,
            UnitCode = e.UnitCode,
            UnitDescription = e.UnitDescription,
            ParentUnitId = e.ParentUnitId,
            ParentUnitName = e.ParentUnit != null ? e.ParentUnit.UnitName : null,
            UnitType = e.UnitType,
            UnitTypeName = e.UnitType.GetDisplayName(),
            UnitLevel = e.UnitLevel,
            CanReceiveExternalMail = e.CanReceiveExternalMail,
            CanSendExternalMail = e.CanSendExternalMail,
            Status = (int)e.StatusId,
            CreatedAt = e.CreateAt
        };

    public override Func<IQueryable<OrganizationalUnit>, IOrderedQueryable<OrganizationalUnit>> OrderBy =>
        query => query.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<OrganizationalUnitListViewModel>>> Handle(
        GetOrganizationalUnitListQuery request,
        CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}

public static class GetOrganizationalUnitListQueryFilterExtensions
{
    public static IQueryable<OrganizationalUnit> ApplyFilter(
        this IQueryable<OrganizationalUnit> query,
        GetOrganizationalUnitListQuery request)
    {
        if (!string.IsNullOrEmpty(request.SearchText))
        {
            var searchText = request.SearchText.ToLower();
            query = query.Where(x =>
                x.UnitName.ToLower().Contains(searchText) ||
                x.UnitCode.ToLower().Contains(searchText) ||
                (x.UnitDescription != null && x.UnitDescription.ToLower().Contains(searchText)));
        }

        if (request.ParentUnitId.HasValue)
        {
            query = query.Where(x => x.ParentUnitId == request.ParentUnitId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => (int)x.StatusId == request.Status.Value);
        }

        return query;
    }
}
