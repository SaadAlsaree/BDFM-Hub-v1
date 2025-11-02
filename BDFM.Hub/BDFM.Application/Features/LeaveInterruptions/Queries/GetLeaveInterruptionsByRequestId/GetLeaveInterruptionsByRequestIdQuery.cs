namespace BDFM.Application.Features.LeaveInterruptions.Queries.GetLeaveInterruptionsByRequestId;

public class GetLeaveInterruptionsByRequestIdQuery : IRequest<Response<List<LeaveInterruptionViewModel>>>
{
    public Guid LeaveRequestId { get; set; }
}



