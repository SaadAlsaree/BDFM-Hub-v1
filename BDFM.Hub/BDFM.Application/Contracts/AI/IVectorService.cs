using BDFM.Application.Models.AI;
using BDFM.Domain.Models;

namespace BDFM.Application.Contracts.AI;

public interface IVectorService
{
    Task SaveEmbeddingsAsync(List<VectorEmbedding> embeddings);
    Task<List<SearchResult>> SearchSimilarAsync(float[] queryEmbedding, int maxResults = 10, float threshold = 0.7f);
    Task<bool> DeleteEmbeddingsByCorrespondenceIdAsync(string correspondenceId);
    Task<List<VectorEmbedding>> GetEmbeddingsByCorrespondenceIdAsync(string correspondenceId);
}
