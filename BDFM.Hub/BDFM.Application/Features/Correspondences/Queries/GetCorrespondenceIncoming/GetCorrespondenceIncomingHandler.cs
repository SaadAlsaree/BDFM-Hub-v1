using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;


namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceIncoming
{
    internal class GetCorrespondenceIncomingHandler : GetAllWithCountHandler<Domain.Entities.Core.Correspondence, GetCorrespondenceIncomingVm, GetCorrespondenceIncomingQuery>, IRequestHandler<GetCorrespondenceIncomingQuery, Response<PagedResult<GetCorrespondenceIncomingVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly IBaseRepository<User> _userRepository;


        public GetCorrespondenceIncomingHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService, IPermissionValidationService permissionValidationService, IBaseRepository<User> userRepository) : base(repository)
        {
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
            _userRepository = userRepository;
        }

        public override Expression<Func<Correspondence, GetCorrespondenceIncomingVm>> Selector => x => new GetCorrespondenceIncomingVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            PriorityLevel = x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            SecrecyLevel = x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            CorrespondenceType = x.CorrespondenceType,
            CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
            WorkflowStepId = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Id).FirstOrDefault(),
            MailNum = x.MailNum,
            MailDate = x.MailDate,
            ExternalReferenceNumber = x.ExternalReferenceNumber!,
            ExternalReferenceDate = x.ExternalReferenceDate.HasValue ? x.ExternalReferenceDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue,
            ReceivedDate = x.LastUpdateAt ?? x.CreateAt,
            FileId = x.FileId,
            IsDraft = x.IsDraft,
            FileNumber = x.MailFile != null ? x.MailFile.FileNumber : null,
            DueDate = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.DueDate).FirstOrDefault(),
            Status = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Status).FirstOrDefault(),
            WorkflowStepStatusName = x.WorkflowSteps.Where(y => y.DueDate.HasValue).Select(y => y.Status.GetDisplayName()).FirstOrDefault() ?? string.Empty,

            // Unit information from workflow step
            UnitId = x.WorkflowSteps.Where(y => y.DueDate.HasValue && y.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                .Select(y => y.ToPrimaryRecipientId).FirstOrDefault(),
            UnitName = x.WorkflowSteps.Where(y => y.DueDate.HasValue && y.ToPrimaryRecipientType == RecipientTypeEnum.Unit && y.FromUnit != null)
                .Select(y => y.FromUnit!.UnitName).FirstOrDefault(),
            UnitCode = x.WorkflowSteps.Where(y => y.DueDate.HasValue && y.ToPrimaryRecipientType == RecipientTypeEnum.Unit && y.FromUnit != null)
                .Select(y => y.FromUnit!.UnitCode).FirstOrDefault(),

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

        public override Func<IQueryable<Correspondence>, IOrderedQueryable<Correspondence>> OrderBy => x => x.OrderByDescending(x => x.CreateAt);

        public async Task<Response<PagedResult<GetCorrespondenceIncomingVm>>> Handle(GetCorrespondenceIncomingQuery request, CancellationToken cancellationToken)
        {
            // Get user's related unit IDs (parent units + their unit + sub-units)
            var accessibleUnitIds = await _permissionValidationService.GetAllRelatedUnitIdsAsync(cancellationToken);

            var user = await _userRepository.Find(x => x.Id == _currentUserService.UserId);

            var query = _repository.Query();

            // Apply filtering with current user context
            query = query.ApplyFilterIncoming();

            // Filter for incoming external correspondences only and apply user access control
            query = query.Where(c =>
                c.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal &&
                (
                    // User is the creator of the correspondence
                    c.CreateByUserId == _currentUserService.UserId ||
                    // Correspondence is assigned to user's organizational unit (primary recipient)
                    c.WorkflowSteps.Any(ws =>
                        ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                        accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)
                    ) ||
                    // Correspondence has user's organizational unit as secondary recipient
                    c.WorkflowSteps.Any(ws =>
                        ws.SecondaryRecipients.Any(sr =>
                            sr.RecipientType == RecipientTypeEnum.Unit &&
                            accessibleUnitIds.Contains(sr.RecipientId)
                        )
                    ) ||
                    // User is directly assigned as primary recipient
                    c.WorkflowSteps.Any(ws =>
                        ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                        ws.ToPrimaryRecipientId == _currentUserService.UserId
                    ) ||
                    // User is directly assigned as secondary recipient
                    c.WorkflowSteps.Any(ws =>
                        ws.SecondaryRecipients.Any(sr =>
                            sr.RecipientType == RecipientTypeEnum.User &&
                            sr.RecipientId == _currentUserService.UserId
                        )
                    )
                )
            );

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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetCorrespondenceIncomingVm>>(null!);

            var pagedResult = new PagedResult<GetCorrespondenceIncomingVm>
            {
                Items = result,
                TotalCount = count,
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
