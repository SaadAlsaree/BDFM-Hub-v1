using BDFM.Application.Contracts.AI;
using BDFM.Application.Models.AI;
using BDFM.Domain.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace BDFM.Persistence.Services;

public class CorrespondenceService : ICorrespondenceService
{
    private readonly IMongoCollection<CorrespondenceMongo> _correspondences;
    private readonly ILogger<CorrespondenceService> _logger;

    public CorrespondenceService(IMongoClient mongoClient, ILogger<CorrespondenceService> logger)
    {
        var database = mongoClient.GetDatabase("RAG_BDFM_DB");
        _correspondences = database.GetCollection<CorrespondenceMongo>("correspondences");
        _logger = logger;
        CreateIndexes();
    }


    private void CreateIndexes()
    {
        try
        {
            // Drop existing indexes to avoid conflicts
            try
            {
                _correspondences.Indexes.DropAll();
                _logger.LogInformation("Dropped existing indexes");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to drop existing indexes, continuing...");
            }

            // Create simple indexes without text search to avoid language issues
            _correspondences.Indexes.CreateOne(new CreateIndexModel<CorrespondenceMongo>(
                Builders<CorrespondenceMongo>.IndexKeys.Ascending(x => x.CreatedAt)));

            _correspondences.Indexes.CreateOne(new CreateIndexModel<CorrespondenceMongo>(
                Builders<CorrespondenceMongo>.IndexKeys.Ascending(x => x.Language)));

            _correspondences.Indexes.CreateOne(new CreateIndexModel<CorrespondenceMongo>(
                Builders<CorrespondenceMongo>.IndexKeys.Ascending(x => x.MailNum)));

            _correspondences.Indexes.CreateOne(new CreateIndexModel<CorrespondenceMongo>(
                Builders<CorrespondenceMongo>.IndexKeys.Ascending(x => x.Subject)));

            _correspondences.Indexes.CreateOne(new CreateIndexModel<CorrespondenceMongo>(
                Builders<CorrespondenceMongo>.IndexKeys.Ascending(x => x.CorrespondenceType)));

            _correspondences.Indexes.CreateOne(new CreateIndexModel<CorrespondenceMongo>(
               Builders<CorrespondenceMongo>.IndexKeys.Ascending(x => x.FileName)));

            _logger.LogInformation("Created correspondence indexes successfully");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create indexes");
        }
    }

    public async Task<CorrespondenceMongo> CreateCorrespondenceAsync(CreateCorrespondenceRequest request)
    {
        var newCorrespondence = new CorrespondenceMongo
        {
            Id = request.Id,
            MailNum = request.MailNum,
            MailDate = request.MailDate,
            Subject = request.Subject,
            BodyText = request.BodyText,
            CorrespondenceType = request.CorrespondenceType,
            SecrecyLevel = request.SecrecyLevel,
            PriorityLevel = request.PriorityLevel,
            PersonalityLevel = request.PersonalityLevel,
            Language = request.Language,
            FileId = request.FileId,
            FileName = request.FileName,
            CreatedAt = request.CreatedAt,
            Metadata = request.Metadata
        };

        await _correspondences.InsertOneAsync(newCorrespondence);
        _logger.LogInformation("Created correspondence with ID: {Id}", newCorrespondence.Id);
        return newCorrespondence;
    }

    public async Task<bool> DeleteCorrespondenceAsync(string id)
    {
        var result = await _correspondences.DeleteOneAsync(x => x.Id == id);
        _logger.LogInformation("Deleted correspondence with ID: {Id}", id);
        return result.DeletedCount > 0;
    }

    public async Task<List<CorrespondenceMongo>> GetAllCorrespondencesAsync()
    {
        return await _correspondences.Find(_ => true).ToListAsync();
    }

    public async Task<CorrespondenceMongo?> GetCorrespondenceByIdAsync(string id)
    {
        return await _correspondences.Find(x => x.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<CorrespondenceMongo>> SearchCorrespondencesAsync(string query)
    {
        var filter = Builders<CorrespondenceMongo>.Filter.Text(query);
        return await _correspondences.Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> UpdateCorrespondenceAsync(string id, CorrespondenceMongo correspondence)
    {
        correspondence.UpdatedAt = DateTime.UtcNow;
        var result = await _correspondences.ReplaceOneAsync(x => x.Id == id, correspondence);
        _logger.LogInformation("Updated correspondence with ID: {Id}", id);
        return result.ModifiedCount > 0;
    }
}
