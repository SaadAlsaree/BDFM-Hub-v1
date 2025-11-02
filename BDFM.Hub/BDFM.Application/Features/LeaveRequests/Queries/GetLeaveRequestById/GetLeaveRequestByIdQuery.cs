namespace BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestById;

public class GetLeaveRequestByIdQuery : IRequest<Response<LeaveRequestViewModel>>
{
    public Guid Id { get; set; }
}



