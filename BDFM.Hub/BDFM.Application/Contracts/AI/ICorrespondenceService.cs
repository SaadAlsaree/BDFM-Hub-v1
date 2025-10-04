using BDFM.Application.Models.AI;
using BDFM.Domain.Models;

namespace BDFM.Application.Contracts.AI;

public interface ICorrespondenceService
{
    Task<CorrespondenceMongo> CreateCorrespondenceAsync(CreateCorrespondenceRequest request);
    Task<CorrespondenceMongo?> GetCorrespondenceByIdAsync(string id);
    Task<List<CorrespondenceMongo>> GetAllCorrespondencesAsync();
    Task<bool> UpdateCorrespondenceAsync(string id, CorrespondenceMongo correspondence);
    Task<bool> DeleteCorrespondenceAsync(string id);
    Task<List<CorrespondenceMongo>> SearchCorrespondencesAsync(string query);
}
