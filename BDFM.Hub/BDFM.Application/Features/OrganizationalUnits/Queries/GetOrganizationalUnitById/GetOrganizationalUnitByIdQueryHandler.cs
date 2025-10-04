using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitById;

public class GetOrganizationalUnitByIdQueryHandler :
    GetByIdHandler<OrganizationalUnit, OrganizationalUnitViewModel, GetOrganizationalUnitByIdQuery>,
    IRequestHandler<GetOrganizationalUnitByIdQuery, Response<OrganizationalUnitViewModel>>
{
    public GetOrganizationalUnitByIdQueryHandler(IBaseRepository<OrganizationalUnit> repository)
        : base(repository)
    {
    }

    public override Expression<Func<OrganizationalUnit, bool>> IdPredicate(GetOrganizationalUnitByIdQuery request)
    {
        return x => x.Id == request.Id;
    }

    public override Expression<Func<OrganizationalUnit, OrganizationalUnitViewModel>> Selector =>
        e => new OrganizationalUnitViewModel
        {
            Id = e.Id,
            UnitName = e.UnitName,
            UnitCode = e.UnitCode,
            UnitDescription = e.UnitDescription,
            ParentUnitId = e.ParentUnitId,
            ParentUnitName = e.ParentUnit != null ? e.ParentUnit.UnitName : null,
            UnitType = e.UnitType,
            UnitTypeName = e.UnitType.GetDisplayName(),
            Email = e.Email,
            PhoneNumber = e.PhoneNumber,
            Address = e.Address,
            UnitLogo = e.UnitLogo,
            UnitLevel = e.UnitLevel,
            CanReceiveExternalMail = e.CanReceiveExternalMail,
            CanSendExternalMail = e.CanSendExternalMail,
            Status = (int)e.StatusId,
            CreatedAt = e.CreateAt,
            CreatedBy = e.CreateBy.ToString(),
            UpdatedAt = e.LastUpdateAt,
            UpdatedBy = e.LastUpdateBy.ToString()
        };

    public async Task<Response<OrganizationalUnitViewModel>> Handle(GetOrganizationalUnitByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
