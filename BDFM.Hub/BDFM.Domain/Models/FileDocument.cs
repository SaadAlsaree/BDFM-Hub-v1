using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Options;

namespace BDFM.Domain.Models;

public class FileDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("file_name")]
    public string FileName { get; set; } = string.Empty;

    [BsonElement("file_type")]
    public string FileType { get; set; } = string.Empty;

    [BsonElement("file_size")]
    public long FileSize { get; set; }

    [BsonElement("content")]
    public string Content { get; set; } = string.Empty;

    [BsonElement("language")]
    public string Language { get; set; } = "ar"; // Default to Arabic

    [BsonElement("original_path")]
    public string OriginalPath { get; set; } = string.Empty;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("embedding_id")]
    public string? EmbeddingId { get; set; }

    [BsonElement("metadata")]
    [BsonDictionaryOptions(DictionaryRepresentation.Document)]
    public Dictionary<string, string> Metadata { get; set; } = new();
}
