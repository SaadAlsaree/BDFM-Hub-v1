using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateById;

public class GetCorrespondenceTemplateByIdQueryHandler : GetByIdHandler<CorrespondenceTemplate, CorrespondenceTemplateViewModel, GetCorrespondenceTemplateByIdQuery>,
    IRequestHandler<GetCorrespondenceTemplateByIdQuery, Response<CorrespondenceTemplateViewModel>>
{
    public GetCorrespondenceTemplateByIdQueryHandler(IBaseRepository<CorrespondenceTemplate> repository)
        : base(repository)
    {
    }

    public override Expression<Func<CorrespondenceTemplate, bool>> IdPredicate(GetCorrespondenceTemplateByIdQuery request)
    {
        return entity => entity.Id == request.Id && !entity.IsDeleted;
    }

    public override Expression<Func<CorrespondenceTemplate, CorrespondenceTemplateViewModel>> Selector => entity => new CorrespondenceTemplateViewModel
    {
        Id = entity.Id,
        TemplateName = entity.TemplateName,
        Subject = entity.Subject,
        BodyText = entity.BodyText,
        OrganizationalUnitId = entity.OrganizationalUnitId,
        OrganizationalUnitName = entity.OrganizationalUnit != null ? entity.OrganizationalUnit.UnitName : null,
        // CorrespondenceType removed from domain model; omitted here.
        Status = entity.StatusId,
        CreateAt = entity.CreateAt,
        CreateBy = entity.CreateBy,
        LastUpdateAt = entity.LastUpdateAt,
        LastUpdateBy = entity.LastUpdateBy
    };

    public async Task<Response<CorrespondenceTemplateViewModel>> Handle(GetCorrespondenceTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
