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
        var query = _repository.Query();

        // Apply custom filters using the extension method
        query = query.ApplyFilter(request);

        // Apply ordering
        var orderedQuery = OrderBy(query);

        // Apply pagination and get results
        var result = await orderedQuery
            .ApplyPagination(request)
            .Select(Selector)
            .ToListAsync(cancellationToken: cancellationToken);

        // Get count (without pagination)
        var count = await query.CountAsync(cancellationToken: cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<OrganizationalUnitListViewModel>>(null!);

        result.ToList().ForEach(x =>
        {
            (x! as dynamic).StatusName = ((Status)(x as dynamic).Status).GetDisplayName();
        });

        var pagedResult = new PagedResult<OrganizationalUnitListViewModel>
        {
            Items = result,
            TotalCount = count
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}

public static class GetOrganizationalUnitListQueryFilterExtensions
{
    public static IQueryable<OrganizationalUnit> ApplyFilter(
        this IQueryable<OrganizationalUnit> query,
        GetOrganizationalUnitListQuery request)
    {
        // Filter out deleted entities
        query = query.Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            query = query.Where(x =>
                EF.Functions.Like(x.UnitName, request.SearchText + "%") ||
                EF.Functions.Like(x.UnitCode, request.SearchText + "%"));
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
