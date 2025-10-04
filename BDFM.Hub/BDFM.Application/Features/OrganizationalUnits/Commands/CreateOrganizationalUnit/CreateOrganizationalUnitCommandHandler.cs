using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Commands.CreateOrganizationalUnit;

public class CreateOrganizationalUnitCommandHandler :
    CreateHandler<OrganizationalUnit, CreateOrganizationalUnitCommand>,
    IRequestHandler<CreateOrganizationalUnitCommand, Response<bool>>
{
    public CreateOrganizationalUnitCommandHandler(IBaseRepository<OrganizationalUnit> repository)
        : base(repository)
    {
    }

    protected override Expression<Func<OrganizationalUnit, bool>> ExistencePredicate(CreateOrganizationalUnitCommand request)
    {
        return x => x.UnitCode == request.UnitCode;
    }

    protected override OrganizationalUnit MapToEntity(CreateOrganizationalUnitCommand request)
    {
        return new OrganizationalUnit
        {
            UnitName = request.UnitName,
            UnitCode = request.UnitCode,
            UnitDescription = request.UnitDescription,
            ParentUnitId = request.ParentUnitId,
            UnitType = request.UnitType,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            UnitLogo = request.UnitLogo,
            UnitLevel = request.UnitLevel,
            CanReceiveExternalMail = request.CanReceiveExternalMail,
            CanSendExternalMail = request.CanSendExternalMail
        };
    }

    public async Task<Response<bool>> Handle(CreateOrganizationalUnitCommand request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
