namespace BDFM.Application.Models.AI;

public class SearchRequest
{
    public string Query { get; set; } = string.Empty;
    public string Language { get; set; } = "ar";
    public int MaxResults { get; set; } = 10;
    public float SimilarityThreshold { get; set; } = 0.7f;
}
