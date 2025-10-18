using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetOutgoingInternal
{
    internal class GetOutgoingInternalHandler : GetAllWithCountHandler<Correspondence, OutgoingInternalVm, GetOutgoingInternalQuery>, IRequestHandler<GetOutgoingInternalQuery, Response<PagedResult<OutgoingInternalVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly IBaseRepository<User> _userRepository;
        public GetOutgoingInternalHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService, IPermissionValidationService permissionValidationService, IBaseRepository<User> userRepository) : base(repository)
        {
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
            _userRepository = userRepository;
        }

        public override Expression<Func<Correspondence, OutgoingInternalVm>> Selector => x => new OutgoingInternalVm
        {
            CorrespondenceId = x.Id,
            Subject = x.Subject,
            PriorityLevel = x.PriorityLevel == 0 ? PriorityLevelEnum.Normal : x.PriorityLevel,
            PriorityLevelName = x.PriorityLevel.GetDisplayName(),
            SecrecyLevel = x.SecrecyLevel == 0 ? SecrecyLevelEnum.None : x.SecrecyLevel,
            SecrecyLevelName = x.SecrecyLevel.GetDisplayName(),
            CorrespondenceType = x.CorrespondenceType == 0 ? CorrespondenceTypeEnum.OutgoingInternal : x.CorrespondenceType,
            CorrespondenceTypeName = x.CorrespondenceType.GetDisplayName(),
            CorrespondenceStatus = x.Status == 0 ? CorrespondenceStatusEnum.PendingReferral : x.Status,
            CorrespondenceStatusName = x.Status.GetDisplayName(),
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

        public async Task<Response<PagedResult<OutgoingInternalVm>>> Handle(GetOutgoingInternalQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

            var query = _repository.Query();

            // Filter for outgoing internal correspondences only and apply user access control
            query = query.Where(c =>
                c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingInternal &&
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

            // Apply filtering with current user context
            query = query.ApplyFilter();

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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<OutgoingInternalVm>>(null!);

            // Set StatusName for each item (if applicable)
            result.ToList().ForEach(x =>
            {
                // Note: OutgoingInternalVm doesn't have Status property, so this might not be needed
                // But keeping it for consistency with base handler pattern
                try
                {
                    if ((x as dynamic)?.Status != null)
                        (x as dynamic).StatusName = ((Status)(x as dynamic).Status).GetDisplayName();
                }
                catch
                {
                    // Ignore if Status property doesn't exist
                }
            });

            var pagedResult = new PagedResult<OutgoingInternalVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
