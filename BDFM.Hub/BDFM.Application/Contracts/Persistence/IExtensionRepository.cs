using BDFM.Application.Features.Utility.Services.Commands.ChangeStatus;

namespace BDFM.Application.Contracts;
public interface IExtensionRepository<TId> : IDisposable
{

    Task<bool> DeleteRecordAsync(string tableName, TId primaryId);
    Task<bool> ChangeStatusRecordAsync(ChangeStatusCommand<TId> command);
}
