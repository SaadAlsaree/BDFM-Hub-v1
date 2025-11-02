using BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestsByStatus;

public class GetLeaveRequestsByStatusQuery : PaginationQuery, IRequest<Response<PagedResult<LeaveRequestListViewModel>>>
{
    public LeaveRequestStatusEnum Status { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? EmployeeId { get; set; }
}

