using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;

public class GetAllLeaveRequestsQuery : PaginationQuery, IRequest<Response<PagedResult<LeaveRequestListViewModel>>>
{
    public string? EmployeeId { get; set; }
    public LeaveRequestStatusEnum? Status { get; set; }
    public LeaveTypeEnum? LeaveType { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public DateTime? EndDateFrom { get; set; }
    public DateTime? EndDateTo { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public string? SearchTerm { get; set; } // للبحث في EmployeeName, EmployeeNumber, RequestNumber
}

