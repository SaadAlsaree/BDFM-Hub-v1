namespace BDFM.Application.Features.Correspondences.Commands.CreateInternalMail
{
    public class CreateInternalMailCommand : IRequest<Response<Guid>>
    {
        // Basic correspondence properties

        public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date
        public string Subject { get; set; } = string.Empty;
        public string? BodyText { get; set; }
        public Guid? TemplateId { get; set; }
        public SecrecyLevelEnum SecrecyLevel { get; set; }
        public PriorityLevelEnum PriorityLevel { get; set; }
        public PersonalityLevelEnum PersonalityLevel { get; set; } = PersonalityLevelEnum.General;

        // File association (required)
        public Guid FileId { get; set; }
        public bool IsDraft { get; set; } = false;
    }
}
