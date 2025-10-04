using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Delegations.Commands.UpdateDelegation;

public class UpdateDelegationCommandHandler : UpdateHandler<Delegation, UpdateDelegationCommand>,
    IRequestHandler<UpdateDelegationCommand, Response<bool>>
{
    public UpdateDelegationCommandHandler(IBaseRepository<Delegation> repository) : base(repository)
    {
    }

    public override Expression<Func<Delegation, bool>> EntityPredicate(UpdateDelegationCommand request)
    {
        return d => d.Id == request.Id;
    }

    public async Task<Response<bool>> Handle(UpdateDelegationCommand request, CancellationToken cancellationToken)
    {
        // Check if delegation exists
        var delegation = await _repository.Find(
            EntityPredicate(request),
            cancellationToken: cancellationToken);

        if (delegation == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        // Check for overlapping delegations with same delegator, delegatee, and permission/role
        var overlappingDelegation = await _repository.Find(
            d => d.Id != request.Id &&
                d.DelegatorUserId == request.DelegatorUserId &&
                d.DelegateeUserId == request.DelegateeUserId &&
                d.PermissionId == request.PermissionId &&
                d.RoleId == request.RoleId &&
                ((d.StartDate <= request.EndDate && d.EndDate >= request.StartDate) ||
                (request.StartDate <= d.EndDate && request.EndDate >= d.StartDate)),
            cancellationToken: cancellationToken);

        if (overlappingDelegation != null)
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);

        return await HandleBase(request, cancellationToken);
    }
}
