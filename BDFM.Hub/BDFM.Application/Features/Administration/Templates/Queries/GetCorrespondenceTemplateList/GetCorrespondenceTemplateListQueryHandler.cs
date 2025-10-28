using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateList;

public class GetCorrespondenceTemplateListQueryHandler : GetAllWithCountHandler<CorrespondenceTemplate, CorrespondenceTemplateListViewModel, GetCorrespondenceTemplateListQuery>,
    IRequestHandler<GetCorrespondenceTemplateListQuery, Response<PagedResult<CorrespondenceTemplateListViewModel>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetCorrespondenceTemplateListQueryHandler> _logger;

    public GetCorrespondenceTemplateListQueryHandler(
        IBaseRepository<CorrespondenceTemplate> repository,
        ILogger<GetCorrespondenceTemplateListQueryHandler> logger,
        ICurrentUserService currentUserService)
        : base(repository)
    {
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
        // Check if user is SuAdmin or Manager using HasRole from CurrentUserService
        var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") || _currentUserService.HasRole("Manager");

        // Apply base filters
        var query = _repository.Query().ApplyFilter(request);

        // Apply access control based on organizational unit
        if (!isSuAdminOrManager)
        {
            // Regular users can only see templates from their organizational unit
            var userOrgUnitId = _currentUserService.OrganizationalUnitId;

            if (userOrgUnitId.HasValue)
            {
                query = query.Where(t => t.OrganizationalUnitId == userOrgUnitId.Value);
            }
            else
            {
                // Users without organizational unit cannot see any templates
                query = query.Where(t => false);
            }
        }
        // SuAdmin and Managers can see all templates (no additional filter needed)

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
