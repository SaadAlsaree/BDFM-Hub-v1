using BDFM.Application.Contracts.AI;
using BDFM.Domain.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Text;

namespace BDFM.Persistence.Services;

public class EmbeddingService : IEmbeddingService
{

    private readonly IEmbeddingGenerator<string, Embedding<float>> _embeddingGenerator;
    private readonly ILogger<EmbeddingService> _logger;
    private readonly string _embeddingModel = "granite-embedding:278m";


    public EmbeddingService(IEmbeddingGenerator<string, Embedding<float>> embeddingGenerator, ILogger<EmbeddingService> logger)
    {
        _embeddingGenerator = embeddingGenerator;
        _logger = logger;
    }
    public async Task<List<string>> ChunkText(string text, int maxChunkSize = 500)
    {
        var chunks = new List<string>();

        if (string.IsNullOrWhiteSpace(text))
            return chunks;

        // For Arabic text, we need to be careful with word boundaries
        var sentences = text.Split(new[] { '.', '!', '?', '؟', '!', '.' }, StringSplitOptions.RemoveEmptyEntries);
        var currentChunk = new StringBuilder();

        foreach (var sentence in sentences)
        {
            var trimmedSentence = sentence.Trim();
            if (string.IsNullOrEmpty(trimmedSentence))
                continue;

            // Check if adding this sentence would exceed the chunk size
            if (currentChunk.Length + trimmedSentence.Length + 1 > maxChunkSize && currentChunk.Length > 0)
            {
                chunks.Add(currentChunk.ToString().Trim());
                currentChunk.Clear();
            }

            if (currentChunk.Length > 0)
                currentChunk.Append(" ");

            currentChunk.Append(trimmedSentence);
        }

        // Add the last chunk if it has content
        if (currentChunk.Length > 0)
        {
            chunks.Add(currentChunk.ToString().Trim());
        }

        // If no chunks were created (no sentence delimiters), split by character count
        if (chunks.Count == 0 && text.Length > maxChunkSize)
        {
            for (int i = 0; i < text.Length; i += maxChunkSize)
            {
                var chunkLength = Math.Min(maxChunkSize, text.Length - i);
                chunks.Add(text.Substring(i, chunkLength));
            }
        }
        else if (chunks.Count == 0)
        {
            chunks.Add(text);
        }

        return await Task.FromResult(chunks);
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        try
        {
            _logger.LogInformation("Generating embedding for text with length: {Length}", text.Length);

            var result = await _embeddingGenerator.GenerateAsync(text);
            return result.Vector.ToArray();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating embedding for text");
            throw;
        }
    }

    public async Task<List<VectorEmbedding>> GenerateEmbeddingsForCorrespondenceAsync(CorrespondenceMongo correspondence)
    {
        var embeddings = new List<VectorEmbedding>();

        // Combine title and content for better context
        var fullText = $"{correspondence.MailNum}\n\n{correspondence.MailDate} \n\n{correspondence.Subject} \n\n{correspondence.BodyText} \n\n{correspondence.PersonalityLevel} \n\n{correspondence.PriorityLevel} \n\n{correspondence.SecrecyLevel}";
        var chunks = await ChunkText(fullText);

        for (int i = 0; i < chunks.Count; i++)
        {
            var chunk = chunks[i];
            var embeddingVector = await GenerateEmbeddingAsync(chunk);

            var vectorEmbedding = new VectorEmbedding
            {
                CorrespondenceId = correspondence.Id,
                TextChunk = chunk,
                EmbeddingVector = embeddingVector,
                ModelName = _embeddingModel,
                ChunkIndex = i,
                Language = correspondence.Language,
                CreatedAt = DateTime.UtcNow,
                Metadata = new Dictionary<string, string>
                {
                    ["correspondence_id"] = correspondence.Id,
                    ["created_at"] = DateTime.UtcNow.ToString(),
                    ["personality_level"] = correspondence.PersonalityLevel,
                    ["priority_level"] = correspondence.PriorityLevel,
                    ["secrecy_level"] = correspondence.SecrecyLevel,
                    ["correspondence_type"] = correspondence.CorrespondenceType,
                    ["file_id"] = correspondence.FileId,
                    ["file_name"] = correspondence.FileName,
                    ["mail_num"] = correspondence.MailNum,
                    ["mail_date"] = correspondence.MailDate.ToString(),
                    ["subject"] = correspondence.Subject,
                    ["body_text"] = correspondence.BodyText,
                }
            };

            embeddings.Add(vectorEmbedding);
        }

        return embeddings;
    }
}
