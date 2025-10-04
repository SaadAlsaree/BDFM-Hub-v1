namespace BDFM.Application.Models.AI;

public class OllamaSetting
{
    public string Url { get; set; } = "http://localhost:11434";
    public string Model { get; set; } = "deepseek-r1:8b";
    public string EmbeddingModel { get; set; } = "granite-embedding:278m";
    public double Temperature { get; set; } = 0.7;
    public int MaxTokens { get; set; } = 1000;
}
