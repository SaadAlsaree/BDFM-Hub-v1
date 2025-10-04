using Newtonsoft.Json;

namespace BDFM.Application.Features.Correspondences.Commands.CreatePublicMail;

public class CreatePublicMailCommand : IRequest<Response<Guid>>
{
    // Correspondence content
    public DateOnly MailDate { get; set; } // Date of the mail, not the correspondence creation date
    public string Subject { get; set; } = string.Empty;
    public string? BodyText { get; set; }

    // Classification levels
    public SecrecyLevelEnum SecrecyLevel { get; set; }
    public PriorityLevelEnum PriorityLevel { get; set; }
    public PersonalityLevelEnum PersonalityLevel { get; set; } = PersonalityLevelEnum.General;

    // File association
    public Guid? FileId { get; set; }

    [JsonProperty("createdByUserId")]
    public Guid CreatedByUserId { get; set; }

    // Public mail specific properties
    public string? ExternalReferenceNumber { get; set; }
    public DateTime? ExternalReferenceDate { get; set; }
}
