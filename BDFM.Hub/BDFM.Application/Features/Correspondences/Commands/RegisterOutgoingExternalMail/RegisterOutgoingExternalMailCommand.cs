namespace BDFM.Application.Features.Correspondences.Commands.RegisterOutgoingExternalMail
{
    public class RegisterOutgoingExternalMailCommand : IRequest<Response<Guid>>
    {

        public List<string>? OriginatingSubEntities { get; set; } // Optional

        // Core correspondence details
        public string Subject { get; set; } = string.Empty;
        public string? BodyText { get; set; } // Initial text, OCR might update later
        public SecrecyLevelEnum SecrecyLevel { get; set; }
        public PriorityLevelEnum PriorityLevel { get; set; }
        public PersonalityLevelEnum PersonalityLevel { get; set; }

        public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date

        public Guid? ExternalEntityId { get; set; }

        // System and User info
        public Guid CreatedByUserId { get; set; }
        public string? FileNumberToReuse { get; set; } // Optional: if linking to an existing MailFile
    }
}
