namespace BDFM.Application.Features.LeaveCancellations.Queries.GetLeaveCancellationsByRequestId;

public class GetLeaveCancellationsByRequestIdQuery : IRequest<Response<List<LeaveCancellationViewModel>>>
{
    public Guid LeaveRequestId { get; set; }
}



