using BDFM.Application.Models.AI;

namespace BDFM.Application.Contracts.AI;

public interface IRAGService
{
    Task<string> ProcessCorrespondenceAsync(CreateCorrespondenceRequest request);
    Task<RAGResponse> QueryAsync(SearchRequest searchRequest);
    IAsyncEnumerable<string> QueryStreamAsync(SearchRequest searchRequest);
    Task<bool> DeleteCorrespondenceAsync(string id);
    Task<string> ProcessFileDocumentAsync(CreateCorrespondenceRequest request);
}
