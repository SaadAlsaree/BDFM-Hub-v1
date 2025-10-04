using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UnitPermissions.Commands.AssignPermissionsToUnit;

public class AssignPermissionsToUnitCommandHandler : IRequestHandler<AssignPermissionsToUnitCommand, Response<bool>>
{
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly IBaseRepository<Permission> _permissionRepository;
    private readonly IBaseRepository<UnitPermission> _unitPermissionRepository;

    public AssignPermissionsToUnitCommandHandler(
        IBaseRepository<OrganizationalUnit> unitRepository,
        IBaseRepository<Permission> permissionRepository,
        IBaseRepository<UnitPermission> unitPermissionRepository)
    {
        _unitRepository = unitRepository ?? throw new ArgumentNullException(nameof(unitRepository));
        _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
        _unitPermissionRepository = unitPermissionRepository ?? throw new ArgumentNullException(nameof(unitPermissionRepository));
    }

    public async Task<Response<bool>> Handle(AssignPermissionsToUnitCommand request, CancellationToken cancellationToken)
    {
        // Verify unit exists
        var unit = await _unitRepository.Find(u => u.Id == request.UnitId, cancellationToken: cancellationToken);
        if (unit == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Verify all permissions exist
        foreach (var permissionId in request.PermissionIds)
        {
            var permission = await _permissionRepository.Find(
                p => p.Id == permissionId,
                cancellationToken: cancellationToken);

            if (permission == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);
        }

        // Get existing unit permissions
        var existingUnitPermissionsResult = await _unitPermissionRepository.GetAsync<UnitPermission>(
            filter: up => up.UnitId == request.UnitId && !up.IsDeleted,
            cancellationToken: cancellationToken);

        var existingUnitPermissions = existingUnitPermissionsResult.Item1;
        var existingPermissionIds = existingUnitPermissions.Select(up => up.PermissionId).ToList();

        // Find permissions to add (those in request.PermissionIds but not in existingPermissionIds)
        var permissionsToAdd = request.PermissionIds
            .Where(permissionId => !existingPermissionIds.Contains(permissionId))
            .ToList();

        if (!permissionsToAdd.Any())
            return SuccessMessage.Update.ToSuccessMessage(true); // Nothing new to add

        // Create new unit-permission relationships
        var unitPermissionsToAdd = permissionsToAdd.Select(permissionId => new UnitPermission
        {
            Id = Guid.NewGuid(),
            UnitId = request.UnitId,
            PermissionId = permissionId,
            CreateAt = DateTime.UtcNow,
            StatusId = Status.Active
        }).ToList();

        var result = await _unitPermissionRepository.CreateRange(unitPermissionsToAdd, cancellationToken: cancellationToken);

        return result
            ? SuccessMessage.Create.ToSuccessMessage(true)
            : ErrorsMessage.FailOnCreate.ToErrorMessage(false);
    }
}
