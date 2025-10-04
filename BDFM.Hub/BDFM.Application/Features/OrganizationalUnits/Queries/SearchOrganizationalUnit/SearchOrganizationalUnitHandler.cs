
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Queries.SearchOrganizationalUnit;

internal class SearchOrganizationalUnitHandler : IRequestHandler<SearchOrganizationalUnitQuery, Response<IEnumerable<SearchOrganizationalUnitVm>>>
{
    private readonly IBaseRepository<OrganizationalUnit> _organizationalUnitRepository;
    public SearchOrganizationalUnitHandler(IBaseRepository<OrganizationalUnit> organizationalUnitRepository)
    {
        _organizationalUnitRepository = organizationalUnitRepository;
    }
    public async Task<Response<IEnumerable<SearchOrganizationalUnitVm>>> Handle(SearchOrganizationalUnitQuery request, CancellationToken cancellationToken)
    {
        var result = await _organizationalUnitRepository.GetAsync<SearchOrganizationalUnitVm>(
            filter: x => string.IsNullOrEmpty(request.Unit) ||
                         EF.Functions.Like(x.UnitName, request.Unit + "%") ||
                         EF.Functions.Like(x.UnitCode, request.Unit + "%"),
            selector: x => new SearchOrganizationalUnitVm
            {
                Id = x.Id,
                UnitName = x.UnitName,
                UnitCode = x.UnitCode,
                ParentUnitId = x.ParentUnitId,
                ParentUnitName = x.ParentUnit != null ? x.ParentUnit.UnitName : string.Empty,
                CreatedAt = x.CreateAt,
                UnitDescription = x.UnitDescription,
                UnitType = x.UnitType,
                UnitTypeName = x.UnitType.ToString(),
                UnitLevel = x.UnitLevel,
                CanReceiveExternalMail = x.CanReceiveExternalMail,
                CanSendExternalMail = x.CanSendExternalMail

            },
            orderBy: q => q.OrderBy(x => x.UnitName),
            take: 10,
            cancellationToken: cancellationToken
        );

        return SuccessMessage.Get.ToSuccessMessage(result.Item1);
    }
}
