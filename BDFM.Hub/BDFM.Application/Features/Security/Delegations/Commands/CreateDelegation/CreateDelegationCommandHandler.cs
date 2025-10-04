using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Delegations.Commands.CreateDelegation;

public class CreateDelegationCommandHandler : CreateHandler<Delegation, CreateDelegationCommand>, IRequestHandler<CreateDelegationCommand, Response<bool>>
{
    public CreateDelegationCommandHandler(IBaseRepository<Delegation> repository) : base(repository)
    {
    }

    protected override Expression<Func<Delegation, bool>> ExistencePredicate(CreateDelegationCommand request)
    {
        return d => d.DelegatorUserId == request.DelegatorUserId &&
                   d.DelegateeUserId == request.DelegateeUserId &&
                   d.PermissionId == request.PermissionId &&
                   d.RoleId == request.RoleId &&
                   ((d.StartDate <= request.EndDate && d.EndDate >= request.StartDate) ||
                   (request.StartDate <= d.EndDate && request.EndDate >= d.StartDate));
    }

    protected override Delegation MapToEntity(CreateDelegationCommand request)
    {
        return new Delegation
        {
            DelegatorUserId = request.DelegatorUserId,
            DelegateeUserId = request.DelegateeUserId,
            PermissionId = request.PermissionId,
            RoleId = request.RoleId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive
        };
    }

    public async Task<Response<bool>> Handle(CreateDelegationCommand request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
