using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Options;

namespace BDFM.Domain.Models;

public class CorrespondenceMongo
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("mail_num")]
    public string MailNum { get; set; } = string.Empty;

    [BsonElement("mail_date")]
    public DateOnly MailDate { get; set; }

    [BsonElement("subject")]
    public string Subject { get; set; } = string.Empty;

    [BsonElement("body_text")]
    public string BodyText { get; set; } = string.Empty;

    [BsonElement("correspondence_type")]
    public string CorrespondenceType { get; set; } = string.Empty;

    [BsonElement("secrecy_level")]
    public string SecrecyLevel { get; set; } = string.Empty;

    [BsonElement("priority_level")]
    public string PriorityLevel { get; set; } = string.Empty;

    [BsonElement("personality_level")]
    public string PersonalityLevel { get; set; } = string.Empty;

    [BsonElement("content_language")]
    public string Language { get; set; } = "ar"; // Default to Arabic

    [BsonElement("file_id")]
    public string FileId { get; set; } = string.Empty;

    [BsonElement("file_name")]
    public string FileName { get; set; } = string.Empty;

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
