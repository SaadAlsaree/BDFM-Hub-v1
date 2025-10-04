using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitTree;

public class GetOrganizationalUnitTreeQueryHandler :
    IRequestHandler<GetOrganizationalUnitTreeQuery, Response<List<OrganizationalUnitTreeViewModel>>>
{
    private readonly IBaseRepository<OrganizationalUnit> _repository;

    public GetOrganizationalUnitTreeQueryHandler(IBaseRepository<OrganizationalUnit> repository)
    {
        _repository = repository;
    }

    public async Task<Response<List<OrganizationalUnitTreeViewModel>>> Handle(
        GetOrganizationalUnitTreeQuery request,
        CancellationToken cancellationToken)
    {
        // Get all organizational units
        var allUnits = await _repository.Query()
            .Include(x => x.ChildUnits)
            .ToListAsync(cancellationToken);

        if (!allUnits.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<OrganizationalUnitTreeViewModel>>(null!);

        // Filter root units based on request
        var rootUnits = request.RootUnitId.HasValue
            ? allUnits.Where(x => x.Id == request.RootUnitId.Value).ToList()
            : allUnits.Where(x => x.ParentUnitId == null).ToList();

        if (!rootUnits.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<OrganizationalUnitTreeViewModel>>(null!);

        // Build the tree
        var result = BuildTree(rootUnits, allUnits);
        return SuccessMessage.Get.ToSuccessMessage(result);
    }

    private List<OrganizationalUnitTreeViewModel> BuildTree(
        List<OrganizationalUnit> units,
        List<OrganizationalUnit> allUnits)
    {
        var result = new List<OrganizationalUnitTreeViewModel>();

        foreach (var unit in units)
        {
            var unitViewModel = new OrganizationalUnitTreeViewModel
            {
                Id = unit.Id,
                UnitName = unit.UnitName,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                UnitTypeName = unit.UnitType.GetDisplayName(),
                ParentUnitId = unit.ParentUnitId,
                UnitLevel = unit.UnitLevel,
                CanReceiveExternalMail = unit.CanReceiveExternalMail,
                CanSendExternalMail = unit.CanSendExternalMail,
                Email = unit.Email,
                PhoneNumber = unit.PhoneNumber,
                Address = unit.Address
            };

            // Get children for this unit
            var children = allUnits.Where(x => x.ParentUnitId == unit.Id).ToList();
            if (children.Any())
            {
                unitViewModel.Children = BuildTree(children, allUnits);
            }

            result.Add(unitViewModel);
        }

        return result;
    }
}
