using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.LeaveBalances.Queries.GetLeaveBalanceHistory;

public class GetLeaveBalanceHistoryQuery : PaginationQuery, IRequest<Response<PagedResult<LeaveBalanceHistoryViewModel>>>
{
    public string? EmployeeId { get; set; }
    public LeaveTypeEnum? LeaveType { get; set; }
    public DateTime? ChangeDateFrom { get; set; }
    public DateTime? ChangeDateTo { get; set; }
    public string? ChangeType { get; set; }
}

