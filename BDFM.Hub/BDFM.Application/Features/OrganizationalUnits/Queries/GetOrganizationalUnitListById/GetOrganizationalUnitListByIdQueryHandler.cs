using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitListById;

public class GetOrganizationalUnitListByIdQueryHandler :
    IRequestHandler<GetOrganizationalUnitListByIdQuery, Response<List<GetOrganizationalUnitListByIdVM>>>
{
    private readonly IBaseRepository<OrganizationalUnit> _repository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetOrganizationalUnitListByIdQueryHandler(
        IBaseRepository<OrganizationalUnit> repository,
        IBaseRepository<User> userRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Response<List<GetOrganizationalUnitListByIdVM>>> Handle(
        GetOrganizationalUnitListByIdQuery request,
        CancellationToken cancellationToken)
    {

        var currentUser = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
        if (currentUser == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<GetOrganizationalUnitListByIdVM>>(null!);



        if (currentUser.OrganizationalUnitId == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<GetOrganizationalUnitListByIdVM>>(null!);

        // First, verify that the parent unit exists
        var parentUnit = await _repository.Query()
            .FirstOrDefaultAsync(x => x.Id == currentUser.OrganizationalUnitId, cancellationToken);

        if (parentUnit == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<GetOrganizationalUnitListByIdVM>>(null!);

        // Get all organizational units to work with hierarchy
        var baseQuery = _repository.Query();

        // Filter by status if not including inactive units
        if (!request.IncludeInactive)
        {
            baseQuery = baseQuery.Where(x => x.StatusId == Status.Active);
        }

        var allUnits = await baseQuery
            .Include(x => x.ParentUnit)
            .ToListAsync(cancellationToken);

        // Get all descendant units recursively
        var descendantUnits = GetAllDescendants(currentUser.OrganizationalUnitId.Value, allUnits);

        // Convert to ViewModels and order by UnitName
        var result = descendantUnits
            .Select(e => new GetOrganizationalUnitListByIdVM
            {
                Id = e.Id,
                UnitName = e.UnitName,
                UnitCode = e.UnitCode,
                UnitDescription = e.UnitDescription,
                ParentUnitId = e.ParentUnitId,
                ParentUnitName = e.ParentUnit?.UnitName,
                UnitType = e.UnitType,
                UnitTypeName = e.UnitType.GetDisplayName(),
                UnitLevel = e.UnitLevel,
                CanReceiveExternalMail = e.CanReceiveExternalMail,
                CanSendExternalMail = e.CanSendExternalMail,
                Status = (int)e.StatusId,
                StatusName = e.StatusId.ToString(),
                CreatedAt = e.CreateAt
            })
            .OrderBy(x => x.UnitLevel)
            .ThenBy(x => x.UnitName)
            .ToList();

        return SuccessMessage.Get.ToSuccessMessage(result);
    }

    private List<OrganizationalUnit> GetAllDescendants(Guid parentId, List<OrganizationalUnit> allUnits)
    {
        var descendants = new List<OrganizationalUnit>();
        var directChildren = allUnits.Where(x => x.ParentUnitId == parentId).ToList();

        foreach (var child in directChildren)
        {
            descendants.Add(child);
            // Recursively get descendants of this child
            descendants.AddRange(GetAllDescendants(child.Id, allUnits));
        }

        return descendants;
    }
}
