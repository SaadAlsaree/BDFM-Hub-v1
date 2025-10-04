namespace BDFM.Application.Features.WorkflowStepSecondary.Queries.GetWorkflowStepSecondaryByStepId
{
    public class WorkflowStepSecondaryRecipientVM
    {
        public Guid Id { get; set; } // Add the WorkflowStepSecondaryRecipient Id
        public Guid StepId { get; set; }
        public RecipientTypeEnum RecipientType { get; set; } // User or Unit

        public Guid RecipientId { get; set; } // UserID or UnitID

        // Recipient details (populated based on RecipientType)
        public string RecipientName { get; set; } = string.Empty; // User.FullName or Unit.UnitName
        public string? RecipientCode { get; set; } // User.UserLogin or Unit.UnitCode
        public string? RecipientEmail { get; set; } // User.Email or Unit.Email

        // User-specific details (only populated when RecipientType = User)
        public UserDetailsDto? UserDetails { get; set; }

        // Unit-specific details (only populated when RecipientType = Unit)
        public UnitDetailsDto? UnitDetails { get; set; }

        public string? Purpose { get; set; } // Text type in DB (???????? ????????)
        public string? InstructionText { get; set; } // Text type in DB (???? ????)

        // Audit fields
        public DateTime CreateAt { get; set; }
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
    }

    public class UserDetailsDto
    {
        public string Username { get; set; } = string.Empty;
        public string UserLogin { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public Guid? OrganizationalUnitId { get; set; }
        public string? OrganizationalUnitName { get; set; }
        public string? OrganizationalUnitCode { get; set; }
        public string? PositionTitle { get; set; }
    }

    public class UnitDetailsDto
    {
        public string UnitName { get; set; } = string.Empty;
        public string UnitCode { get; set; } = string.Empty; // e.g., "HR", "IT", "Finance"
        public string? UnitDescription { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public Guid? ParentUnitId { get; set; }
        public string? ParentUnitName { get; set; }
    }
}
