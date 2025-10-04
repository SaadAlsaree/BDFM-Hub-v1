using BDFM.Domain.Models;

namespace BDFM.Application.Contracts.AI;

public interface IEmbeddingService
{
    Task<float[]> GenerateEmbeddingAsync(string text);
    Task<List<VectorEmbedding>> GenerateEmbeddingsForCorrespondenceAsync(CorrespondenceMongo correspondence);
    Task<List<string>> ChunkText(string text, int maxChunkSize = 500);
}
