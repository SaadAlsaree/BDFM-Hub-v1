using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport
{
    public class DelayedStepReportDto
    {
        public Guid AssigneeId { get; set; }
        public string AssigneeName { get; set; } = string.Empty;
        public string AssigneeType { get; set; } = string.Empty; // "User" or "OrganizationalUnit"
        public int DelayedStepsCount { get; set; }
        public List<DelayedStepDetailDto> DelayedSteps { get; set; } = new();
    }

    public class DelayedStepDetailDto
    {
        public Guid StepId { get; set; }
        public string StepName { get; set; } = string.Empty; // Using ActionType or InstructionText
        public string CorrespondenceSubject { get; set; } = string.Empty;
        public string CorrespondenceNumber { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public int DaysLate { get; set; } // Calculated property
        public WorkflowStepStatus Status { get; set; }
    }
}
