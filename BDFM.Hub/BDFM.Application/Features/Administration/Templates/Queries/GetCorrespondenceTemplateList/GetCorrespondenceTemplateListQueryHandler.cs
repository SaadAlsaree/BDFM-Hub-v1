using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateList;

public class GetCorrespondenceTemplateListQueryHandler : GetAllWithCountHandler<CorrespondenceTemplate, CorrespondenceTemplateListViewModel, GetCorrespondenceTemplateListQuery>,
    IRequestHandler<GetCorrespondenceTemplateListQuery, Response<PagedResult<CorrespondenceTemplateListViewModel>>>
{
    public GetCorrespondenceTemplateListQueryHandler(IBaseRepository<CorrespondenceTemplate> repository)
        : base(repository)
    {
    }

    public override Expression<Func<CorrespondenceTemplate, CorrespondenceTemplateListViewModel>> Selector => entity => new CorrespondenceTemplateListViewModel
    {
        Id = entity.Id,
        TemplateName = entity.TemplateName,
        OrganizationalUnitId = entity.OrganizationalUnitId,
        OrganizationalUnitName = entity.OrganizationalUnit != null ? entity.OrganizationalUnit.UnitName : null,
        Subject = entity.Subject,
        BodyText = entity.BodyText,
        Status = entity.StatusId,
        CreateAt = entity.CreateAt
    };

    public override Func<IQueryable<CorrespondenceTemplate>, IOrderedQueryable<CorrespondenceTemplate>> OrderBy =>
        query => query.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<CorrespondenceTemplateListViewModel>>> Handle(GetCorrespondenceTemplateListQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query().ApplyFilter(request);

        var result = await query
            .Select(Selector)
            .OrderBy(x => x.CreateAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var totalCount = await query.CountAsync(cancellationToken);

        return new Response<PagedResult<CorrespondenceTemplateListViewModel>>
        {
            Data = new PagedResult<CorrespondenceTemplateListViewModel>
            {
                Items = result,
                TotalCount = totalCount,

            },
            Succeeded = true,
            Message = SuccessMessage.Get.ToString()
        };

    }
}
