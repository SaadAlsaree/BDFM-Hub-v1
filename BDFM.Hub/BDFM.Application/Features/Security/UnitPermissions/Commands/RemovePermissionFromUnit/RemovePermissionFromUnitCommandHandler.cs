using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UnitPermissions.Commands.RemovePermissionFromUnit;

public class RemovePermissionFromUnitCommandHandler : IRequestHandler<RemovePermissionFromUnitCommand, Response<bool>>
{
    private readonly IBaseRepository<UnitPermission> _unitPermissionRepository;

    public RemovePermissionFromUnitCommandHandler(IBaseRepository<UnitPermission> unitPermissionRepository)
    {
        _unitPermissionRepository = unitPermissionRepository ?? throw new ArgumentNullException(nameof(unitPermissionRepository));
    }

    public async Task<Response<bool>> Handle(RemovePermissionFromUnitCommand request, CancellationToken cancellationToken)
    {
        var unitPermission = await _unitPermissionRepository.Find(
            up => up.UnitId == request.UnitId && up.PermissionId == request.PermissionId && !up.IsDeleted,
            cancellationToken: cancellationToken);

        if (unitPermission == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Soft delete by setting IsDeleted flag and updating status
        unitPermission.IsDeleted = true;
        unitPermission.DeletedAt = DateTime.UtcNow;
        unitPermission.StatusId = Status.InActive;

        var result = _unitPermissionRepository.Update(unitPermission);

        return result
            ? SuccessMessage.Delete.ToSuccessMessage(true)
            : ErrorsMessage.FailOnDelete.ToErrorMessage(false);
    }
}
