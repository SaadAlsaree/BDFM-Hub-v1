using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondencesSummary;

public class GetCorrespondencesSummaryHandler : IRequestHandler<GetCorrespondencesSummaryCommand, Response<GetCorrespondencesSummaryVm>>
{
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IPermissionValidationService _permissionValidationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetCorrespondencesSummaryHandler> _logger;

    private const string PERMISSION_GET_SUMMARY = "Correspondence|GetSummary";
    private const string PERMISSION_VIEW_ALL = "Access|All";

    public GetCorrespondencesSummaryHandler(
        IBaseRepository<Correspondence> correspondenceRepository,
        IPermissionValidationService permissionValidationService,
        ICurrentUserService currentUserService,
        ILogger<GetCorrespondencesSummaryHandler> logger)
    {
        _correspondenceRepository = correspondenceRepository;
        _permissionValidationService = permissionValidationService ?? throw new ArgumentNullException(nameof(permissionValidationService));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Response<GetCorrespondencesSummaryVm>> Handle(GetCorrespondencesSummaryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Validate basic permission to get summary
            //var hasPermission = await _permissionValidationService.HasPermissionAsync(PERMISSION_GET_SUMMARY, cancellationToken);
            //if (!hasPermission)
            //{
            //    _logger.LogWarning("User {UserId} does not have permission {Permission}", _currentUserService.UserId, PERMISSION_GET_SUMMARY);
            //    return Response<GetCorrespondencesSummaryVm>.Fail(new List<object> { "Unauthorized" }, new MessageResponse { Code = "Error403", Message = "Access denied" });
            //}

            // Build base query
            var queryable = _correspondenceRepository.Query();

            // Always exclude deleted
            queryable = queryable.Where(c => !c.IsDeleted);

            // Apply correspondence type filter if provided
            if (request.CorrespondenceType.HasValue)
            {
                var typeValue = request.CorrespondenceType.Value;
                queryable = queryable.Where(c => c.CorrespondenceType == typeValue);
            }

            // If a specific unit filter was provided, and caller requested it, apply it now
            if (request.UnitId.HasValue)
            {
                var unitId = request.UnitId.Value;
                // basic unit filter: created by unit or workflow from unit
                queryable = queryable.Where(c => (c.CreateByUser != null && c.CreateByUser.OrganizationalUnitId == unitId) || c.WorkflowSteps.Any(ws => ws.FromUnitId == unitId));
                // conservative include of one-level children when requested
                if (request.IncludeSubUnits)
                {
                    queryable = queryable.Where(c => (c.CreateByUser != null && c.CreateByUser.OrganizationalUnit != null && c.CreateByUser.OrganizationalUnit.ParentUnitId == unitId) || c.WorkflowSteps.Any(ws => ws.FromUnit != null && ws.FromUnit.ParentUnitId == unitId) || (c.CreateByUser != null && c.CreateByUser.OrganizationalUnitId == unitId) || c.WorkflowSteps.Any(ws => ws.FromUnitId == unitId));
                }
            }

            // 2. Check if user has ViewAll permission; otherwise apply workflow-based access filtering
            var canViewAll = await _permissionValidationService.HasPermissionAsync(PERMISSION_VIEW_ALL, cancellationToken);
            if (!canViewAll)
            {
                _logger.LogDebug("User {UserId} has limited access - applying workflow-based filtering", _currentUserService.UserId);

                var accessibleUnitIds = (await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken)).ToList();

                queryable = queryable.Where(c => !c.IsDeleted && (
                    // User created the correspondence
                    c.CreateBy == _currentUserService.UserId ||

                    // For others, check workflow participation against accessible units
                    (c.CreateBy != _currentUserService.UserId && c.WorkflowSteps.Any(ws =>
                        (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == _currentUserService.UserId) ||
                        (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                        ws.SecondaryRecipients.Any(sr => (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == _currentUserService.UserId) || (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && accessibleUnitIds.Contains(sr.RecipientId))) ||
                        ws.Interactions.Any(wsi => wsi.InteractingUserId == _currentUserService.UserId)
                    ))
                ));
            }

            var correspondences = (await _correspondenceRepository.GetAsync(filter: c => queryable.Contains(c), include: q => q.Include(x => x.CreateByUser).Include(x => x.WorkflowSteps))).ToList();

            var vm = new GetCorrespondencesSummaryVm
            {
                TotalCorrespondences = correspondences.Count,
                TotalCorrespondencesPending = correspondences.Count(c => c.Status == CorrespondenceStatusEnum.PendingReferral),
                TotalCorrespondencesUnderProcessing = correspondences.Count(c => c.Status == CorrespondenceStatusEnum.UnderProcessing),
                TotalCorrespondencesCompleted = correspondences.Count(c => c.Status == CorrespondenceStatusEnum.Completed),
                TotalCorrespondencesRejected = correspondences.Count(c => c.Status == CorrespondenceStatusEnum.Rejected),
                TotalCorrespondencesReturnedForModification = correspondences.Count(c => c.Status == CorrespondenceStatusEnum.ReturnedForModification),
                TotalCorrespondencesPostponed = correspondences.Count(c => c.Status == CorrespondenceStatusEnum.Postponed),

                TotalIncomingExternal = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal),
                TotalOutgoingExternal = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingExternal),
                TotalIncomingInternal = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingInternal),
                TotalOutgoingInternal = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingInternal),
                TotalMemorandum = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.Memorandum),
                TotalReplies = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.Reply),
                TotalPublics = correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.Public),
                TotalDrafts = correspondences.Count(c => c.IsDraft),
            };




            return Response<GetCorrespondencesSummaryVm>.Success(vm);
        }
        catch (Exception ex)
        {
            return Response<GetCorrespondencesSummaryVm>.Fail(new List<object> { ex.Message }, new MessageResponse { Code = "Error3000", Message = "خطأ في تحميل ملخص المراسلات" });
        }
    }
}
