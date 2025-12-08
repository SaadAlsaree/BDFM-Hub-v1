using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondencesWithTags;

public class GetCorrespondencesWithTagsQueryHandler :
    GetAllWithCountHandler<Correspondence, CorrespondenceWithTagsVm, GetCorrespondencesWithTagsQuery>,
    IRequestHandler<GetCorrespondencesWithTagsQuery, Response<PagedResult<CorrespondenceWithTagsVm>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetCorrespondencesWithTagsQueryHandler> _logger;
    private readonly IBaseRepository<Tag> _tagRepository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;

    public GetCorrespondencesWithTagsQueryHandler(
        IBaseRepository<Correspondence> repository,
        IBaseRepository<Tag> tagRepository,
        IBaseRepository<User> userRepository,
        IBaseRepository<OrganizationalUnit> unitRepository,
        ICurrentUserService currentUserService,
        ILogger<GetCorrespondencesWithTagsQueryHandler> logger) : base(repository)
    {
        _tagRepository = tagRepository ?? throw new ArgumentNullException(nameof(tagRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _unitRepository = unitRepository ?? throw new ArgumentNullException(nameof(unitRepository));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public override Expression<Func<Correspondence, CorrespondenceWithTagsVm>> Selector => x => new CorrespondenceWithTagsVm
    {
        CorrespondenceId = x.Id,
        Subject = x.Subject,
        BodyText = x.BodyText ?? string.Empty,
        PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
        PriorityLevelName = x.PriorityLevel.GetDisplayName(),
        SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
        SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
        CorrespondenceType = x.CorrespondenceType,
        CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
        CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
        CorrespondenceStatusName = x.Status.GetDisplayName(),
        WorkflowStepId = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Id).FirstOrDefault(),
        MailNum = x.MailNum,
        MailDate = x.MailDate,
        ExternalReferenceNumber = x.ExternalReferenceNumber ?? string.Empty,
        CreatedByUnitName = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null
            ? x.CreateByUser.OrganizationalUnit.UnitName
            : string.Empty,
        CreatedByUnitCode = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null
            ? x.CreateByUser.OrganizationalUnit.UnitCode
            : string.Empty,
        CreatedByUserName = x.CreateByUser != null
            ? x.CreateByUser.Username
            : string.Empty,
        ReceivedDate = x.LastUpdateAt ?? x.CreateAt,
        FileId = x.FileId,
        IsDraft = x.IsDraft,
        FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
        DueDate = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.DueDate).FirstOrDefault(),
        Status = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Status).FirstOrDefault(),
        WorkflowStepStatusName = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Status.GetDisplayName()).FirstOrDefault() ?? string.Empty,

        // Tags will be populated after materialization to avoid EF Core translation issues
        Tags = new List<TagInfoDto>(),
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
        }
    };

    public override Func<IQueryable<Correspondence>, IOrderedQueryable<Correspondence>> OrderBy =>
        x => x.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<CorrespondenceWithTagsVm>>> Handle(
        GetCorrespondencesWithTagsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            var currentUserOrganizationalUnitId = _currentUserService.OrganizationalUnitId;

            _logger.LogDebug(
                "Getting correspondences with tags for UserId: {UserId}, OrganizationalUnitId: {OrganizationalUnitId}",
                currentUserId,
                currentUserOrganizationalUnitId);

            // Start with base query (excluding deleted)
            var query = _repository.Query().Where(c => !c.IsDeleted);

            // Filter correspondences that have tags accessible to the current user
            // A correspondence is accessible if it has at least one tag that matches:
            // 1. IsAll == true (accessible to everyone)
            // 2. ToPrimaryRecipientType == User && ToPrimaryRecipientId == currentUserId
            // 3. ToPrimaryRecipientType == Unit && currentUserOrganizationalUnitId == ToPrimaryRecipientId (exact match only, no sub-units)
            // Get accessible correspondence IDs from tags
            var accessibleCorrespondenceIds = await _tagRepository.Query()
                .Where(t => !t.IsDeleted && (
                    t.IsAll ||
                    (t.ToPrimaryRecipientType == RecipientTypeEnum.User && 
                     t.ToPrimaryRecipientId == currentUserId) ||
                    (t.ToPrimaryRecipientType == RecipientTypeEnum.Unit && 
                     currentUserOrganizationalUnitId.HasValue &&
                     t.ToPrimaryRecipientId == currentUserOrganizationalUnitId.Value)
                ))
                .Select(t => t.CorrespondenceId)
                .Distinct()
                .ToListAsync(cancellationToken);

            // Filter correspondences by accessible IDs
            if (accessibleCorrespondenceIds.Any())
            {
                query = query.Where(c => accessibleCorrespondenceIds.Contains(c.Id));
            }
            else
            {
                // If no accessible tags found, return empty result
                query = query.Where(c => false);
            }

            // Apply additional filters from request
            if (!string.IsNullOrEmpty(request.MailNum))
            {
                query = query.Where(c => c.MailNum.Contains(request.MailNum));
            }

            // Filter by category - get correspondence IDs that have tags with the specified category
            // Only filter from already accessible correspondences
            if (request.Category.HasValue)
            {
                var correspondenceIdsWithCategory = await _tagRepository.Query()
                    .Where(t => !t.IsDeleted && 
                               t.Category == request.Category.Value &&
                               accessibleCorrespondenceIds.Contains(t.CorrespondenceId))
                    .Select(t => t.CorrespondenceId)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                if (correspondenceIdsWithCategory.Any())
                {
                    // Filter query to only include correspondences with the specified category
                    query = query.Where(c => correspondenceIdsWithCategory.Contains(c.Id));
                }
                else
                {
                    // If no correspondences found with this category, return empty result
                    query = query.Where(c => false);
                }
            }

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.Subject.ToLower().Contains(searchTerm) ||
                    c.MailNum.ToLower().Contains(searchTerm) ||
                    (c.ExternalReferenceNumber != null && c.ExternalReferenceNumber.ToLower().Contains(searchTerm)) ||
                    (c.BodyText != null && c.BodyText.ToLower().Contains(searchTerm))
                );
            }

            // Apply ordering
            var orderedQuery = OrderBy(query);

            // Get count before pagination
            var count = await query.CountAsync(cancellationToken);

            // Apply pagination and get results
            var result = await orderedQuery
                .ApplyPagination(request)
                .Select(Selector)
                .ToListAsync(cancellationToken);

            if (!result.Any())
            {
                _logger.LogDebug("No correspondences with tags found for UserId: {UserId}", currentUserId);
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<CorrespondenceWithTagsVm>>(null!);
            }

            // Get correspondence IDs to load tags
            var correspondenceIds = result.Select(r => r.CorrespondenceId).ToList();

            // Load tags for all correspondences in one query, grouped by correspondence ID
            var tagsWithCorrespondenceId = await _tagRepository.Query()
                .Where(t => correspondenceIds.Contains(t.CorrespondenceId) && !t.IsDeleted)
                .Select(t => new
                {
                    CorrespondenceId = t.CorrespondenceId,
                    Tag = new TagInfoDto
                    {
                        TagId = t.Id,
                        TagName = t.Name ?? string.Empty,
                        Category = t.Category,
                        CategoryName = t.Category.GetDisplayName(),
                        IsAll = t.IsAll,
                        FromUserId = t.FromUserId,
                        FromUser = t.FromUser != null ? new UserDetailVm
                        {
                            Id = t.FromUser.Id,
                            Username = t.FromUser.Username,
                            UserLogin = t.FromUser.UserLogin,
                            OrganizationalUnitId = t.FromUser.OrganizationalUnitId ?? Guid.Empty,
                            OrganizationalUnitName = t.FromUser.OrganizationalUnit != null ? t.FromUser.OrganizationalUnit.UnitName : string.Empty,
                            OrganizationalUnitCode = t.FromUser.OrganizationalUnit != null ? t.FromUser.OrganizationalUnit.UnitCode : string.Empty,
                        } : null,
                        FromUnitId = t.FromUnitId,
                        FromUnit = t.FromUnit != null ? new OrganizationalUnitDetailVm
                        {
                            UnitName = t.FromUnit.UnitName,
                            UnitCode = t.FromUnit.UnitCode,
                            UnitDescription = t.FromUnit.UnitDescription,
                        } : null,
                        ToPrimaryRecipientType = t.ToPrimaryRecipientType,
                        ToPrimaryRecipientTypeName = t.ToPrimaryRecipientType.GetDisplayName(),
                        ToPrimaryRecipientId = t.ToPrimaryRecipientId,
                        ToPrimaryRecipientName = string.Empty, // Will be populated after query
                    }
                })
                .ToListAsync(cancellationToken);

            // Group tags by correspondence ID
            var tagsByCorrespondence = tagsWithCorrespondenceId
                .GroupBy(x => x.CorrespondenceId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Tag).ToList());

            // Populate recipient information for each tag
            foreach (var tagsList in tagsByCorrespondence.Values)
            {
                foreach (var tagItem in tagsList)
                {
                    if (tagItem.ToPrimaryRecipientType == RecipientTypeEnum.User)
                    {
                        var user = await _userRepository.Find(
                            u => u.Id == tagItem.ToPrimaryRecipientId,
                            include: query => query.Include(u => u.OrganizationalUnit!),
                            cancellationToken: cancellationToken);

                        if (user != null)
                        {
                            tagItem.ToPrimaryRecipientName = user.FullName;
                        }
                    }
                    else if (tagItem.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                    {
                        var unit = await _unitRepository.Find(
                            u => u.Id == tagItem.ToPrimaryRecipientId,
                            cancellationToken: cancellationToken);

                        if (unit != null)
                        {
                            tagItem.ToPrimaryRecipientName = unit.UnitName;
                        }
                    }
                }
            }

            // Populate tags for each correspondence
            foreach (var item in result)
            {
                if (tagsByCorrespondence.TryGetValue(item.CorrespondenceId, out var correspondenceTags))
                {
                    item.Tags = correspondenceTags;
                }
            }



            var pagedResult = new PagedResult<CorrespondenceWithTagsVm>
            {
                Items = result,
                TotalCount = count
            };

            _logger.LogDebug(
                "Successfully retrieved {Count} correspondences with tags for UserId: {UserId}",
                result.Count,
                currentUserId);

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving correspondences with tags for UserId: {UserId}", _currentUserService.UserId);
            return Response<PagedResult<CorrespondenceWithTagsVm>>.Fail(
                new List<object> { "Internal server error" },
                new MessageResponse { Code = "Error500", Message = "An error occurred while retrieving correspondences with tags" });
        }
    }
}

