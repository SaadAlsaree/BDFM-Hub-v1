using BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestsByEmployeeId;

public class GetLeaveRequestsByEmployeeIdQuery : PaginationQuery, IRequest<Response<PagedResult<LeaveRequestListViewModel>>>
{
    public string EmployeeId { get; set; } = string.Empty;
    public LeaveRequestStatusEnum? Status { get; set; }
    public LeaveTypeEnum? LeaveType { get; set; }
}

