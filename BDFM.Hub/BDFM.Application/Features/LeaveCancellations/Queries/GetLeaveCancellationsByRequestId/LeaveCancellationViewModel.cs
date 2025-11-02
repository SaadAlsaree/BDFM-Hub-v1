namespace BDFM.Application.Features.LeaveCancellations.Queries.GetLeaveCancellationsByRequestId;

public class LeaveCancellationViewModel
{
    public Guid Id { get; set; }
    public Guid LeaveRequestId { get; set; }
    public DateTime CancellationDate { get; set; }
    public Guid CancelledByUserId { get; set; }
    public string? CancelledByUserName { get; set; }
    public string? EmployeeId { get; set; }
    public string? Reason { get; set; }
    public bool IsBalanceRestored { get; set; }
    public decimal? RestoredDays { get; set; }

    public DateTime CreateAt { get; set; }
}



