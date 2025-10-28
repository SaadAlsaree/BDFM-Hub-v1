
using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceOutgoing
{
    public class GetCorrespondenceOutgoingHandler : GetAllWithCountHandler<Correspondence, GetCorrespondenceOutgoingVm, GetCorrespondenceOutgoingQuery>, IRequestHandler<GetCorrespondenceOutgoingQuery, Response<PagedResult<GetCorrespondenceOutgoingVm>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;
        private readonly IBaseRepository<User> _userRepository;

        public GetCorrespondenceOutgoingHandler(IBaseRepository<Correspondence> repository, ICurrentUserService currentUserService, IPermissionValidationService permissionValidationService, IBaseRepository<User> userRepository) : base(repository)
        {
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
            _userRepository = userRepository;
        }

        public override Expression<Func<Correspondence, GetCorrespondenceOutgoingVm>> Selector => x => new GetCorrespondenceOutgoingVm
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

        public async Task<Response<PagedResult<GetCorrespondenceOutgoingVm>>> Handle(GetCorrespondenceOutgoingQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.Find(x => x.Id == _currentUserService.UserId);
            var userUnitId = _currentUserService.OrganizationalUnitId;

            var query = _repository.Query();

            // Filter for outgoing external correspondences only and apply user access control
            // Standard users can only see correspondence from their own unit (not parent/child units)
            query = query.Where(c =>
                c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingExternal &&
                (
                    // User is the creator of the correspondence
                    c.CreateByUserId == _currentUserService.UserId ||
                    // Correspondence is assigned to user's organizational unit (primary recipient - exact unit match)
                    c.WorkflowSteps.Any(ws =>
                        ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                        userUnitId.HasValue &&
                        ws.ToPrimaryRecipientId == userUnitId.Value
                    ) ||
                    // Correspondence has user's organizational unit as secondary recipient (exact unit match)
                    c.WorkflowSteps.Any(ws =>
                        ws.SecondaryRecipients.Any(sr =>
                            sr.RecipientType == RecipientTypeEnum.Unit &&
                            userUnitId.HasValue &&
                            sr.RecipientId == userUnitId.Value
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
                return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetCorrespondenceOutgoingVm>>(null!);

            var pagedResult = new PagedResult<GetCorrespondenceOutgoingVm>
            {
                Items = result,
                TotalCount = count
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
