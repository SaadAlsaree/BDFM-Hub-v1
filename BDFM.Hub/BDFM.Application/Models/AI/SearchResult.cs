namespace BDFM.Application.Models.AI;

public class SearchResult
{
    public string Id { get; set; } = string.Empty;


    public string MailNum { get; set; } = string.Empty;


    public DateOnly MailDate { get; set; }

    public string Subject { get; set; } = string.Empty;


    public string BodyText { get; set; } = string.Empty;

    public string CorrespondenceType { get; set; } = string.Empty;

    public string SecrecyLevel { get; set; } = string.Empty;


    public string PriorityLevel { get; set; } = string.Empty;

    public string PersonalityLevel { get; set; } = string.Empty;

    public string Language { get; set; } = "ar"; // Default to Arabic

    public string FileId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public float SimilarityScore { get; set; }


    public Dictionary<string, string> Metadata { get; set; } = new();
}
