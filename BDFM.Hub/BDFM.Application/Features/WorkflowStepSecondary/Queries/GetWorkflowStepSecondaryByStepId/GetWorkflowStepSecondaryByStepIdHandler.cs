using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.WorkflowStepSecondary.Queries.GetWorkflowStepSecondaryByStepId;

public class GetWorkflowStepSecondaryByStepIdHandler : GetAllWithCountHandler<WorkflowStepSecondaryRecipient, WorkflowStepSecondaryRecipientVM, GetWorkflowStepSecondaryByStepIdQuery>
    , IRequestHandler<GetWorkflowStepSecondaryByStepIdQuery, Response<PagedResult<WorkflowStepSecondaryRecipientVM>>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;

    public GetWorkflowStepSecondaryByStepIdHandler(
        IBaseRepository<WorkflowStepSecondaryRecipient> repository,
        IBaseRepository<User> userRepository,
        IBaseRepository<OrganizationalUnit> unitRepository) : base(repository)
    {
        _userRepository = userRepository;
        _unitRepository = unitRepository;
    }

    public override Expression<Func<WorkflowStepSecondaryRecipient, WorkflowStepSecondaryRecipientVM>> Selector =>
        wssr => new WorkflowStepSecondaryRecipientVM
        {
            Id = wssr.Id,
            StepId = wssr.StepId,
            RecipientType = wssr.RecipientType,
            RecipientId = wssr.RecipientId,
            Purpose = wssr.Purpose,
            InstructionText = wssr.InstructionText,
            CreateAt = wssr.CreateAt,
            StatusId = (int)wssr.StatusId,
            StatusName = string.Empty,
            // Note: RecipientName, RecipientCode, RecipientEmail, UserDetails, and UnitDetails 
            // will be populated in the Handle method as EF can't handle polymorphic joins in projections
            RecipientName = string.Empty,
            RecipientCode = null,
            RecipientEmail = null,
            UserDetails = null,
            UnitDetails = null
        };

    public override Func<IQueryable<WorkflowStepSecondaryRecipient>, IOrderedQueryable<WorkflowStepSecondaryRecipient>> OrderBy =>
        order => order.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<WorkflowStepSecondaryRecipientVM>>> Handle(GetWorkflowStepSecondaryByStepIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Build the base query with filters
            var query = _repository.Query(wssr => wssr.StepId == request.StepId);

            // Apply optional filters
            if (request.RecipientType.HasValue)
            {
                query = query.Where(wssr => wssr.RecipientType == request.RecipientType.Value);
            }

            if (request.RecipientId.HasValue)
            {
                query = query.Where(wssr => wssr.RecipientId == request.RecipientId.Value);
            }

            // Get the total count before applying pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply ordering and pagination
            var orderedQuery = OrderBy(query);
            var pagedQuery = orderedQuery
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize);

            // Project to ViewModel
            var recipientList = await pagedQuery.Select(Selector).ToListAsync(cancellationToken);

            // Now populate the polymorphic recipient details and status names
            await PopulateRecipientDetails(recipientList, cancellationToken);

            var pagedResult = new PagedResult<WorkflowStepSecondaryRecipientVM>
            {
                Items = recipientList,
                TotalCount = totalCount
            };

            return Response<PagedResult<WorkflowStepSecondaryRecipientVM>>.Success(pagedResult);
        }
        catch (Exception ex)
        {
            return Response<PagedResult<WorkflowStepSecondaryRecipientVM>>.Fail(
                new MessageResponse { Code = "Error5000", Message = $"Error retrieving workflow step secondary recipients: {ex.Message}" });
        }
    }

    private async Task PopulateRecipientDetails(List<WorkflowStepSecondaryRecipientVM> recipients, CancellationToken cancellationToken)
    {
        // Populate status names for all recipients
        foreach (var recipient in recipients)
        {
            recipient.StatusName = ((Status)recipient.StatusId).GetDisplayName();
        }

        // Group recipients by type for efficient querying
        var userRecipients = recipients.Where(r => r.RecipientType == RecipientTypeEnum.User).ToList();
        var unitRecipients = recipients.Where(r => r.RecipientType == RecipientTypeEnum.Unit).ToList();

        // Populate User details
        if (userRecipients.Any())
        {
            var userIds = userRecipients.Select(r => r.RecipientId).ToList();
            var users = await _userRepository
                .Query(u => userIds.Contains(u.Id))
                .Include(u => u.OrganizationalUnit)
                .ToListAsync(cancellationToken);

            foreach (var recipient in userRecipients)
            {
                var user = users.FirstOrDefault(u => u.Id == recipient.RecipientId);
                if (user != null)
                {
                    recipient.RecipientName = user.FullName;
                    recipient.RecipientCode = user.UserLogin;
                    recipient.RecipientEmail = user.Email;
                    recipient.UserDetails = new UserDetailsDto
                    {
                        Username = user.Username,
                        UserLogin = user.UserLogin,
                        FullName = user.FullName,
                        Email = user.Email,
                        OrganizationalUnitId = user.OrganizationalUnitId,
                        OrganizationalUnitName = user.OrganizationalUnit?.UnitName,
                        OrganizationalUnitCode = user.OrganizationalUnit?.UnitCode,
                        PositionTitle = user.PositionTitle
                    };
                }
            }
        }

        // Populate Unit details
        if (unitRecipients.Any())
        {
            var unitIds = unitRecipients.Select(r => r.RecipientId).ToList();
            var units = await _unitRepository
                .Query(u => unitIds.Contains(u.Id))
                .Include(u => u.ParentUnit)
                .ToListAsync(cancellationToken);

            foreach (var recipient in unitRecipients)
            {
                var unit = units.FirstOrDefault(u => u.Id == recipient.RecipientId);
                if (unit != null)
                {
                    recipient.RecipientName = unit.UnitName;
                    recipient.RecipientCode = unit.UnitCode;
                    recipient.RecipientEmail = unit.Email;
                    recipient.UnitDetails = new UnitDetailsDto
                    {
                        UnitName = unit.UnitName,
                        UnitCode = unit.UnitCode,
                        UnitDescription = unit.UnitDescription,
                        Email = unit.Email,
                        PhoneNumber = unit.PhoneNumber,
                        Address = unit.Address,
                        ParentUnitId = unit.ParentUnitId,
                        ParentUnitName = unit.ParentUnit?.UnitName
                    };
                }
            }
        }
    }
}
