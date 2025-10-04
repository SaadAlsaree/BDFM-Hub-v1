using BDFM.Application.Contracts.AI;
using BDFM.Application.Models.AI;
using BDFM.Domain.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace BDFM.Persistence.Services;

public class VectorService : IVectorService
{
    private readonly IMongoCollection<VectorEmbedding> _embeddings;
    private readonly IMongoCollection<CorrespondenceMongo> _correspondences;
    private readonly ILogger<VectorService> _logger;

    public VectorService(IMongoClient mongoClient, ILogger<VectorService> logger)
    {
        var database = mongoClient.GetDatabase("RAG_BDFM_DB");
        _embeddings = database.GetCollection<VectorEmbedding>("embeddings");
        _correspondences = database.GetCollection<CorrespondenceMongo>("correspondences");
        _logger = logger;

        CreateIndexes();
    }

    private void CreateIndexes()
    {
        try
        {
            _embeddings.Indexes.CreateOne(new CreateIndexModel<VectorEmbedding>(
                Builders<VectorEmbedding>.IndexKeys.Ascending(x => x.CorrespondenceId)));

            _embeddings.Indexes.CreateOne(new CreateIndexModel<VectorEmbedding>(
                Builders<VectorEmbedding>.IndexKeys.Ascending(x => x.Language)));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create vector indexes");
        }
    }

    public async Task SaveEmbeddingsAsync(List<VectorEmbedding> embeddings)
    {
        if (embeddings.Any())
        {
            await _embeddings.InsertManyAsync(embeddings);
            _logger.LogInformation("Saved {Count} embeddings", embeddings.Count);
        }
    }

    public async Task<List<SearchResult>> SearchSimilarAsync(float[] queryEmbedding, int maxResults = 10, float threshold = 0.7f)
    {
        var allEmbeddings = await _embeddings.Find(_ => true).ToListAsync();
        var similarities = new List<(VectorEmbedding embedding, float similarity)>();

        foreach (var embedding in allEmbeddings)
        {
            var similarity = CalculateCosineSimilarity(queryEmbedding, embedding.EmbeddingVector);
            if (similarity >= threshold)
            {
                similarities.Add((embedding, similarity));
            }
        }

        // Sort by similarity descending and take top results
        var topSimilarities = similarities
            .OrderByDescending(x => x.similarity)
            .Take(maxResults)
            .ToList();

        var results = new List<SearchResult>();
        var correspondenceIds = topSimilarities.Select(x => x.embedding.CorrespondenceId).Distinct();

        // Get correspondence details for each result
        var correspondences = await _correspondences
            .Find(Builders<CorrespondenceMongo>.Filter.In(x => x.Id, correspondenceIds))
            .ToListAsync();

        var correspondenceDict = correspondences.ToDictionary(x => x.Id);

        foreach (var (embedding, similarity) in topSimilarities)
        {
            if (correspondenceDict.TryGetValue(embedding.CorrespondenceId, out var correspondence))
            {
                results.Add(new SearchResult
                {
                    Id = correspondence.Id,
                    CreatedAt = correspondence.CreatedAt,
                    MailNum = correspondence.MailNum,
                    MailDate = correspondence.MailDate,
                    Subject = correspondence.Subject,
                    BodyText = correspondence.BodyText,
                    CorrespondenceType = correspondence.CorrespondenceType,
                    SecrecyLevel = correspondence.SecrecyLevel,
                    PriorityLevel = correspondence.PriorityLevel,
                    PersonalityLevel = correspondence.PersonalityLevel,
                    Language = correspondence.Language,
                    FileId = correspondence.FileId,
                    SimilarityScore = similarity
                });
            }
        }

        return results.GroupBy(x => x.Id)
                     .Select(g => g.OrderByDescending(x => x.SimilarityScore).First())
                     .OrderByDescending(x => x.SimilarityScore)
                     .ToList();
    }

    public async Task<bool> DeleteEmbeddingsByCorrespondenceIdAsync(string correspondenceId)
    {
        var result = await _embeddings.DeleteManyAsync(x => x.CorrespondenceId == correspondenceId);
        return result.DeletedCount > 0;
    }

    public async Task<List<VectorEmbedding>> GetEmbeddingsByCorrespondenceIdAsync(string correspondenceId)
    {
        return await _embeddings.Find(x => x.CorrespondenceId == correspondenceId).ToListAsync();
    }

    private static float CalculateCosineSimilarity(float[] vectorA, float[] vectorB)
    {
        if (vectorA.Length != vectorB.Length)
            return 0f;

        double dotProduct = 0;
        double magnitudeA = 0;
        double magnitudeB = 0;

        for (int i = 0; i < vectorA.Length; i++)
        {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        magnitudeA = Math.Sqrt(magnitudeA);
        magnitudeB = Math.Sqrt(magnitudeB);

        if (magnitudeA == 0 || magnitudeB == 0)
            return 0f;

        return (float)(dotProduct / (magnitudeA * magnitudeB));
    }
}

