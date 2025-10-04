using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Options;

namespace BDFM.Domain.Models;

public class VectorEmbedding
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("correspondence_id")]
    public string CorrespondenceId { get; set; } = string.Empty;

    [BsonElement("text_chunk")]
    public string TextChunk { get; set; } = string.Empty;

    [BsonElement("embedding_vector")]
    public float[] EmbeddingVector { get; set; } = Array.Empty<float>();

    [BsonElement("model_name")]
    public string ModelName { get; set; } = "granite-embedding:278m";

    [BsonElement("chunk_index")]
    public int ChunkIndex { get; set; }

    [BsonElement("content_language")]
    public string Language { get; set; } = "ar";

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("metadata")]
    [BsonDictionaryOptions(DictionaryRepresentation.Document)]
    public Dictionary<string, string> Metadata { get; set; } = new();
}
