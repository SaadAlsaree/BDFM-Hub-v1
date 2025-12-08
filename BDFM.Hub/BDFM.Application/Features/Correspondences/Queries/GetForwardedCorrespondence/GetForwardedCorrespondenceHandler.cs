using BDFM.Application.Contracts.Identity;
using BDFM.Application.Extensions;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Correspondences.Queries.GetForwardedCorrespondence;

internal class GetForwardedCorrespondenceHandler : GetAllWithCountHandler<Correspondence, GetForwardedCorrespondenceVm, GetForwardedCorrespondenceQuery>
, IRequestHandler<GetForwardedCorrespondenceQuery, Response<PagedResult<GetForwardedCorrespondenceVm>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetForwardedCorrespondenceHandler> _logger;

    public GetForwardedCorrespondenceHandler(
        IBaseRepository<Correspondence> repository,
        ICurrentUserService currentUserService,
        ILogger<GetForwardedCorrespondenceHandler> logger) : base(repository)
    {
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override Expression<Func<Correspondence, GetForwardedCorrespondenceVm>> Selector => x => new GetForwardedCorrespondenceVm
    {
        CorrespondenceId = x.Id,
        WorkflowStepId = x.WorkflowSteps.Where(y => y.IsActive).Select(y => y.Id).FirstOrDefault(),
        Subject = x.Subject,
        CorrespondenceType = x.CorrespondenceType,
        CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
        CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
        CorrespondenceStatusName = x.Status.GetDisplayName(),
        ExternalReferenceNumber = x.ExternalReferenceNumber ?? string.Empty,
        ExternalReferenceDate = x.ExternalReferenceDate.HasValue ? x.ExternalReferenceDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue,
        MailNum = x.MailNum,
        MailDate = x.MailDate,
        CreatedByUnitName = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null ? x.CreateByUser.OrganizationalUnit.UnitName : string.Empty,
        PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
        PriorityLevelName = x.PriorityLevel.GetDisplayName(),
        SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
        SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
        ReceivedDate = x.WorkflowSteps.Where(y => y.IsActive).Select(y => y.CreateAt).FirstOrDefault(),
        DueDate = x.WorkflowSteps.Where(y => y.IsActive && y.DueDate.HasValue).Select(y => y.DueDate).FirstOrDefault(),
        Status = x.WorkflowSteps.Where(y => y.IsActive).Select(y => y.Status).FirstOrDefault(),
        WorkflowStepStatusName = x.WorkflowSteps.Where(y => y.IsActive).Select(y => y.Status.GetDisplayName()).FirstOrDefault() ?? string.Empty,
        StatusName = x.WorkflowSteps.Where(y => y.IsActive).Select(y => y.Status.GetDisplayName()).FirstOrDefault() ?? string.Empty,
        FileId = x.FileId,
        FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
        IsDraft = x.IsDraft,
        UserCorrespondenceInteraction = x.UserCorrespondenceInteractions.Where(y => y.UserId == _currentUserService.UserId).Select(y => new UserCorrespondenceInteractionDto
        {
            UserId = y.UserId,
            CorrespondenceId = y.CorrespondenceId,
            IsStarred = y.IsStarred,
            IsInTrash = y.IsInTrash,
            IsRead = y.IsRead,
            LastReadAt = y.LastReadAt,
            PostponedUntil = y.PostponedUntil,
            ReceiveNotifications = y.ReceiveNotifications
        }).FirstOrDefault() ?? new UserCorrespondenceInteractionDto
        {
            UserId = _currentUserService.UserId,
            CorrespondenceId = x.Id
        },
        WorkflowSteps = new List<WorkflowStepVm>()
    };

    public override Func<IQueryable<Correspondence>, IOrderedQueryable<Correspondence>> OrderBy => x => x.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<GetForwardedCorrespondenceVm>>> Handle(GetForwardedCorrespondenceQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Get user's organizational unit
            var userUnitId = _currentUserService.OrganizationalUnitId;
            if (!userUnitId.HasValue)
            {
                _logger.LogWarning("User {UserId} does not belong to any organizational unit", _currentUserService.UserId);
                return Response<PagedResult<GetForwardedCorrespondenceVm>>.Fail(
                    new List<object> { "User not assigned to unit" },
                    new MessageResponse { Code = "Error400", Message = "User must be assigned to an organizational unit to view forwarded correspondence." });
            }

            _logger.LogDebug("User {UserId} showing forwarded correspondence for their unit only", _currentUserService.UserId);

            // Filter correspondences that have WorkflowSteps directed to the current user or their unit only
            var query = _repository.Query().Where(c => !c.IsDeleted && c.WorkflowSteps.Any(ws => ws.Status != WorkflowStepStatus.Pending && (
                // Case A: Forwarded to current user personally
                (ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                 ws.ToPrimaryRecipientId == _currentUserService.UserId) ||
                
                // Case B: Forwarded to user's unit only (not hierarchical)
                (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                 ws.ToPrimaryRecipientId == userUnitId.Value) ||
                
                // Case C: User is secondary recipient
                ws.SecondaryRecipients.Any(sr => 
                    sr.RecipientType == RecipientTypeEnum.User && 
                    sr.RecipientId == _currentUserService.UserId) ||
                
                // Case D: User's unit is secondary recipient
                ws.SecondaryRecipients.Any(sr => 
                    sr.RecipientType == RecipientTypeEnum.Unit && 
                    sr.RecipientId == userUnitId.Value)
            )));

            // Apply additional filters from the request
            query = query.ApplyFilterForwardedCorrespondence(request, applyIsDeletedFilter: false);

            // Apply ordering
            var orderedQuery = OrderBy(query);

            // Apply pagination and get results
            var result = await orderedQuery
                .ApplyPagination(request)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            // Get count (without pagination)
            var count = await query.CountAsync(cancellationToken);

            if (!result.Any())
            {
                _logger.LogDebug("No forwarded correspondence found for user {UserId} with current filters", _currentUserService.UserId);
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetForwardedCorrespondenceVm>>(null!);
            }

            // Set StatusName for each item
            result.ToList().ForEach(x =>
            {
                try
                {
                    x.StatusName = x.Status.GetDisplayName();
                }
                catch
                {
                    // Ignore if Status property doesn't exist
                }
            });

            var pagedResult = new PagedResult<GetForwardedCorrespondenceVm>
            {
                Items = result,
                TotalCount = count
            };

            _logger.LogDebug("Successfully retrieved {Count} forwarded correspondence items for user {UserId}", result.Count, _currentUserService.UserId);
            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving forwarded correspondence for user {UserId}", _currentUserService.UserId);
            return Response<PagedResult<GetForwardedCorrespondenceVm>>.Fail(
                new List<object> { "Internal server error" },
                new MessageResponse { Code = "Error500", Message = "An error occurred while retrieving forwarded correspondence" });
        }
    }
}
