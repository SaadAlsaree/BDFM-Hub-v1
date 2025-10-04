namespace BDFM.Application.Models.AI;

public class RAGResponse
{
    public string Answer { get; set; } = string.Empty;
    public List<SearchResult> Sources { get; set; } = new();
    public string Language { get; set; } = "ar";
}
