using BDFM.Application.Contracts;

namespace BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
public class DeleteRecordHandler<TId> : IRequestHandler<DeleteRecordCommand<TId>, Response<bool>>
{
    private readonly IExtensionRepository<TId> _extensionRepository;
    public DeleteRecordHandler(IExtensionRepository<TId> extensionRepository)
    {
        _extensionRepository = extensionRepository ?? throw new ArgumentNullException(nameof(extensionRepository));
    }
    public async Task<Response<bool>> Handle(DeleteRecordCommand<TId> request, CancellationToken cancellationToken)
    {
        var result = await _extensionRepository.DeleteRecordAsync(request.TableName.ToString(), request.Id);
        return result ? SuccessMessage.Update.ToSuccessMessage(result) : ErrorsMessage.FailOnUpdate.ToErrorMessage(result);
    }
}
