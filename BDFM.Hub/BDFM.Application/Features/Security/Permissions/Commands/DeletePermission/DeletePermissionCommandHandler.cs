using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Permissions.Commands.DeletePermission;

public class DeletePermissionCommandHandler : IRequestHandler<DeletePermissionCommand, Response<bool>>
{
    private readonly IBaseRepository<Permission> _repository;

    public DeletePermissionCommandHandler(IBaseRepository<Permission> repository)
    {
        _repository = repository;
    }

    public async Task<Response<bool>> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
    {
        var permission = await _repository.Find(p => p.Id == request.Id, cancellationToken: cancellationToken);
        if (permission == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Check if permission is used in user permissions or unit permissions
        var isUsed = permission.UserPermissions.Any() || permission.UnitPermissions.Any() || permission.Delegations.Any();
        if (isUsed)
            return ErrorsMessage.FailOnDelete.ToErrorMessage(false);

        // Soft delete by setting IsDeleted flag and status to inactive
        permission.IsDeleted = true;
        permission.DeletedAt = DateTime.Now;
        permission.StatusId = Status.InActive;

        var result = _repository.Update(permission);
        return result
            ? SuccessMessage.Delete.ToSuccessMessage(true)
            : ErrorsMessage.FailOnDelete.ToErrorMessage(false);
    }
}
