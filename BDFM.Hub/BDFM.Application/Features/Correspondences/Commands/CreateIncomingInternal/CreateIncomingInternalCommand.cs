namespace BDFM.Application.Features.Correspondences.Commands.CreateIncomingInternal
{
    public class CreateIncomingInternalCommand : IRequest<Response<bool>>
    {
        public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date
        public string Subject { get; set; } = string.Empty;
        public string? BodyText { get; set; }

        // Classification levels
        public SecrecyLevelEnum SecrecyLevel { get; set; }
        public PriorityLevelEnum PriorityLevel { get; set; }
        public PersonalityLevelEnum PersonalityLevel { get; set; } = PersonalityLevelEnum.General;

        // File association
        public Guid? FileId { get; set; }

        public Guid LinkMailId { get; set; }

        // System and User info
        public Guid CreatedByUserId { get; set; }
        public string? FileNumberToReuse { get; set; } // Optional: if linking to an existing MailFile
    }
}
