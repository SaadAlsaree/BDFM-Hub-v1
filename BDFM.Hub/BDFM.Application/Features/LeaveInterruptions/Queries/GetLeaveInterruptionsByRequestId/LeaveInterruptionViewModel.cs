namespace BDFM.Application.Features.LeaveInterruptions.Queries.GetLeaveInterruptionsByRequestId;

public class LeaveInterruptionViewModel
{
    public Guid Id { get; set; }
    public Guid LeaveRequestId { get; set; }
    public DateTime InterruptionDate { get; set; }
    public DateTime ReturnDate { get; set; }
    public LeaveInterruptionTypeEnum InterruptionType { get; set; }
    public string InterruptionTypeName { get; set; } = string.Empty; // Auto-populated
    public string? Reason { get; set; }

    public Guid InterruptedByUserId { get; set; }
    public string? InterruptedByUserName { get; set; }
    public string? EmployeeId { get; set; }

    public bool IsProcessed { get; set; }
    public decimal? AdjustedDays { get; set; }

    public DateTime CreateAt { get; set; }
}



