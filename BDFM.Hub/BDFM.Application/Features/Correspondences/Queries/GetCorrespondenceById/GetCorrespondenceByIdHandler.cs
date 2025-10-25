using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;
using BDFM.Application.Services;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceById
{
    public class GetCorrespondenceByIdHandler : GetByIdHandler<Correspondence, CorrespondenceDetailVm, GetCorrespondenceByIdQuery>,
         IRequestHandler<GetCorrespondenceByIdQuery, Response<CorrespondenceDetailVm>>
    {
        // Get current user
        private readonly ICurrentUserService _currentUserService;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly IAuditTrailService _auditTrailService;

        public GetCorrespondenceByIdHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IBaseRepository<User> userRepository,
            IBaseRepository<OrganizationalUnit> unitRepository,
            IPermissionValidationService permissionValidationService,
            IAuditTrailService auditTrailService) : base(repository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _unitRepository = unitRepository;
            _permissionValidationService = permissionValidationService;
            _auditTrailService = auditTrailService;
        }

        public override Expression<Func<Correspondence, bool>> IdPredicate(GetCorrespondenceByIdQuery request) => x => x.Id == request.Id;

        public override Expression<Func<Correspondence, CorrespondenceDetailVm>> Selector => (x) => new CorrespondenceDetailVm
        {
            Id = x.Id,
            Subject = x.Subject,
            BodyText = x.BodyText,
            CorrespondenceType = x.CorrespondenceType,
            CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
            CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
            CorrespondenceStatusName = x.Status.GetDisplayName(),
            IsDraft = x.IsDraft,
            StatusName = x.Status.GetDisplayName(),
            MailNum = x.MailNum,
            MailDate = x.MailDate,
            FileId = x.FileId,
            MailFileNumber = x.MailFile != null ? x.MailFile.FileNumber : string.Empty,
            MailFileSubject = x.MailFile != null ? x.MailFile.Subject : string.Empty,
            SecrecyLevel = x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            PriorityLevel = x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            PersonalityLevel = x.PersonalityLevel,
            PersonalityLevelName = x.PersonalityLevel.GetDisplayName(),
            CreatedByUserId = x.CreateByUserId ?? Guid.Empty,
            CreatedByUserName = x.CreateByUser != null ? x.CreateByUser.Username : string.Empty,
            CreatedByUnitName = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null ? x.CreateByUser.OrganizationalUnit.UnitName : string.Empty,
            CreatedByUnitCode = x.CreateByUser != null && x.CreateByUser.OrganizationalUnit != null ? x.CreateByUser.OrganizationalUnit.UnitCode : string.Empty,
            CreatedAt = x.CreateAt,
            SignatoryUserId = x.SignatoryUserId,
            FinalizedAt = x.FinalizedAt,
            ExternalEntityId = x.ExternalEntityId,
            ExternalEntityName = x.ExternalEntity != null ? x.ExternalEntity.EntityName : string.Empty,
            ExternalEntityCode = x.ExternalEntity != null ? x.ExternalEntity.EntityCode : string.Empty,
            UserCorrespondenceInteraction = x.UserCorrespondenceInteractions.Select(y => new UserCorrespondenceInteractionDto
            {
                UserId = y.UserId,
                CorrespondenceId = y.CorrespondenceId,
                IsStarred = y.IsStarred,
                IsInTrash = y.IsInTrash,
                IsRead = y.IsRead,
                LastReadAt = y.LastReadAt,
                PostponedUntil = y.PostponedUntil,
                ReceiveNotifications = y.ReceiveNotifications

            }).FirstOrDefault(u => u.UserId == _currentUserService.UserId && u.CorrespondenceId == x.Id) ?? new UserCorrespondenceInteractionDto(),

            // 
            WorkflowSteps = x.WorkflowSteps.OrderBy(y => y.Sequence).Select(y => new WorkflowStepHistoryVm
            {
                Id = y.Id,
                CorrespondenceId = x.Id,
                ActionType = y.ActionType,
                ActionTypeName = y.ActionType.GetDisplayName(),
                FromUserId = y.FromUserId,
                FromUser = y.FromUser != null ? new UserDetailVm
                {
                    Id = y.FromUser.Id,
                    Username = y.FromUser.Username,
                    UserLogin = y.FromUser.UserLogin,
                    OrganizationalUnitId = y.FromUser.OrganizationalUnitId ?? Guid.Empty,
                    OrganizationalUnitName = y.FromUser.OrganizationalUnit != null ? y.FromUser.OrganizationalUnit.UnitName : string.Empty,
                    OrganizationalUnitCode = y.FromUser.OrganizationalUnit != null ? y.FromUser.OrganizationalUnit.UnitCode : string.Empty,
                } : null,
                FromUnitId = y.FromUnitId,
                FromUnit = y.FromUnit != null ? new OrganizationalUnitDetailVm
                {
                    UnitName = y.FromUnit.UnitName,
                    UnitCode = y.FromUnit.UnitCode,
                    UnitDescription = y.FromUnit.UnitDescription,
                } : null,
                ToPrimaryRecipientType = y.ToPrimaryRecipientType,
                ToPrimaryRecipientTypeName = y.ToPrimaryRecipientType.GetDisplayName(),
                ToPrimaryRecipientId = y.ToPrimaryRecipientId,
                // This will be populated after the query
                ToPrimaryRecipientName = string.Empty,
                InstructionText = y.InstructionText,
                DueDate = y.DueDate,
                Status = y.Status,
                WorkflowStepStatusName = y.Status.GetDisplayName(),
                IsTimeSensitive = y.IsTimeSensitive,
                CreateAt = y.CreateAt,
                CreateBy = y.CreateBy ?? Guid.Empty,
                Sequence = y.Sequence,
                IsActive = y.IsActive,
                SecondaryRecipients = y.SecondaryRecipients.Select(sr => new SecondaryRecipientVm
                {
                    Id = sr.Id,
                    RecipientId = sr.RecipientId,
                    RecipientType = sr.RecipientType,
                    RecipientName = sr.RecipientType.GetDisplayName(),
                    InstructionText = sr.InstructionText,
                    Purpose = sr.Purpose,
                }).ToList(),

                RecipientActions = y.RecipientActions.Select(ra => new RecipientActionLogVm
                {
                    Id = ra.Id,
                    ActionTakenByUnitId = ra.ActionTakenByUnitId,
                    ActionTakenByUnitName = ra.ActionTakenByUnit != null ? ra.ActionTakenByUnit.UnitName : string.Empty,
                    ActionTakenByUserId = ra.ActionTakenByUserId,
                    ActionTakenByUserName = ra.ActionTakenByUser != null ? ra.ActionTakenByUser.Username : string.Empty,
                    ActionDescription = ra.ActionDescription,
                    ActionTimestamp = ra.ActionTimestamp,
                    InternalActionTypeEnum = ra.InternalActionType,
                    InternalActionTypeEnumName = ra.InternalActionType.GetDisplayName(),
                    Notes = ra.Notes,

                }).ToList(),
                WorkflowStepTodos = y.Todos.Select(wt => new WorkflowStepTodoVm
                {
                    Id = wt.Id,
                    Title = wt.Title,
                    Description = wt.Description,
                    IsCompleted = wt.IsCompleted,
                    DueDate = wt.DueDate,
                    Notes = wt.Notes,
                    CreateAt = wt.CreateAt
                }).ToList(),
            }).OrderBy(y => y.Sequence).Where(y => y.IsActive == true || y.CreateBy == _currentUserService.UserId).ToList(),

            ReferencesToCorrespondences = x.ReferencesTo.Select(y => new LinkedCorrespondenceInfoVm
            {
                LinkId = y.Id,
                LinkType = y.LinkType,
                LinkTypeName = y.LinkType.GetDisplayName(),
                TargetCorrespondenceId = y.LinkedCorrespondenceId,
                TargetSubject = y.LinkedCorrespondence.Subject,
                TargetRefNo = y.LinkedCorrespondence.MailNum,
                Direction = "To",
                Notes = y.Notes,
            }).ToList(),
            ReferencedByCorrespondences = x.ReferencedBy.Select(y => new LinkedCorrespondenceInfoVm
            {
                LinkId = y.Id,
                LinkType = y.LinkType,
                LinkTypeName = y.LinkType.GetDisplayName(),
                TargetCorrespondenceId = y.SourceCorrespondenceId,
                TargetSubject = y.SourceCorrespondence.Subject,
                TargetRefNo = y.SourceCorrespondence.MailNum,
                Direction = "From",
                Notes = y.Notes,
            }).ToList(),

        };

        public async Task<Response<CorrespondenceDetailVm>> Handle(GetCorrespondenceByIdQuery request, CancellationToken cancellationToken)
        {
            // Get user info and access control parameters
            var userUnitId = _currentUserService.OrganizationalUnitId;
            var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") || _currentUserService.HasRole("Manager");
            var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

            var query = _repository.Query();

            // Apply access control filter
            query = query.ApplyCorrespondenceAccessControl(
                _currentUserService.UserId,
                userUnitId,
                isSuAdminOrManager,
                accessibleUnitIds);

            // Apply the ID predicate
            query = query.Where(IdPredicate(request));

            // Get the correspondence with initial data
            var correspondence = await query
                .Select(Selector)
                .FirstOrDefaultAsync(cancellationToken);

            if (correspondence == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage<CorrespondenceDetailVm>(null!);

            // Filter WorkflowSteps based on user access permissions
            var accessibleWorkflowStepIds = await _permissionValidationService.GetAccessibleWorkflowStepIdsAsync(request.Id, cancellationToken);

            // Only include WorkflowSteps that the user can access
            correspondence.WorkflowSteps = correspondence.WorkflowSteps
                .Where(ws => accessibleWorkflowStepIds.Contains(ws.Id))
                .ToList();

            // Now populate the recipient information for each accessible workflow step
            foreach (var workflowStep in correspondence.WorkflowSteps)
            {
                if (workflowStep.ToPrimaryRecipientType == RecipientTypeEnum.User)
                {
                    var user = await _userRepository.Find(
                        u => u.Id == workflowStep.ToPrimaryRecipientId,
                        include: query => query.Include(u => u.OrganizationalUnit!),
                        cancellationToken: cancellationToken);

                    if (user != null)
                    {
                        workflowStep.ToPrimaryRecipientName = user.Username;
                    }
                }
                else if (workflowStep.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                {
                    var unit = await _unitRepository.Find(
                        u => u.Id == workflowStep.ToPrimaryRecipientId,
                        cancellationToken: cancellationToken);

                    if (unit != null)
                    {
                        workflowStep.ToPrimaryRecipientName = unit.UnitName;
                    }
                }
            }

            if (!await _auditTrailService.HasCorrespondenceAuditForUserTodayAsync(request.Id, _currentUserService.UserId, cancellationToken))
            {
                await _auditTrailService.CreateCorrespondenceAuditLogAsync(
                    "جلب تفاصيل كتاب",
                    request.Id,
                    _currentUserService.UserId,
                    $"تم جلب تفاصيل كتاب برقم {correspondence.MailNum}");
            }
            return SuccessMessage.Get.ToSuccessMessage(correspondence);
        }


    }
}
