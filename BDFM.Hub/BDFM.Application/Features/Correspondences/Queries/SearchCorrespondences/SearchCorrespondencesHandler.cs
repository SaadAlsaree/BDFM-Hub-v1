using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Extensions;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.SearchCorrespondences
{
    public class SearchCorrespondencesHandler : IRequestHandler<SearchCorrespondencesQuery, Response<List<SearchCorrespondencesVm>>>
    {
        private readonly IBaseRepository<Correspondence> _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionValidationService _permissionValidationService;

        public SearchCorrespondencesHandler(
            IBaseRepository<Correspondence> repository,
            ICurrentUserService currentUserService,
            IPermissionValidationService permissionValidationService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _permissionValidationService = permissionValidationService;
        }

        public async Task<Response<List<SearchCorrespondencesVm>>> Handle(SearchCorrespondencesQuery request, CancellationToken cancellationToken)
        {
            // Get user info and access control parameters
            var userUnitId = _currentUserService.OrganizationalUnitId;
            var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") || _currentUserService.HasRole("Manager");
            
            // Get appropriate unit IDs based on user role
            var accessibleUnitIds = isSuAdminOrManager 
                ? await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken)
                : await _permissionValidationService.GetAllRelatedUnitIdsAsync(cancellationToken);

            var query = _repository.Query();

            // Apply access control
            query = query.ApplyCorrespondenceAccessControl(
                _currentUserService.UserId,
                userUnitId,
                isSuAdminOrManager,
                accessibleUnitIds);

            query = query.ApplyFilter(request);

            var correspondences = query.ToList();

            // Map Correspondence entities to SearchCorrespondencesVm objects
            var searchResults = correspondences.Select(x => new SearchCorrespondencesVm
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
            }).ToList();

            return await Task.FromResult(SuccessMessage.Get.ToSuccessMessage(searchResults));
        }
    }
}
