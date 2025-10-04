using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Commands.UpdateOrganizationalUnit;

public class UpdateOrganizationalUnitCommandHandler :
    UpdateHandler<OrganizationalUnit, UpdateOrganizationalUnitCommand>,
    IRequestHandler<UpdateOrganizationalUnitCommand, Response<bool>>
{
    public UpdateOrganizationalUnitCommandHandler(IBaseRepository<OrganizationalUnit> repository)
        : base(repository)
    {
    }

    public override Expression<Func<OrganizationalUnit, bool>> EntityPredicate(UpdateOrganizationalUnitCommand request)
    {
        return x => x.Id == request.Id;
    }

    public async Task<Response<bool>> Handle(UpdateOrganizationalUnitCommand request, CancellationToken cancellationToken)
    {
        // Check if unit code is already used by another unit
        var existingUnitWithSameCode = await _repository.Find(
            x => x.UnitCode == request.UnitCode && x.Id != request.Id,
            cancellationToken: cancellationToken);

        if (existingUnitWithSameCode != null)
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);

        return await HandleBase(request, cancellationToken);
    }
}
