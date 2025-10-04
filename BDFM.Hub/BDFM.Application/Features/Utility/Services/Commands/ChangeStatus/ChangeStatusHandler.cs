using BDFM.Application.Contracts;

namespace BDFM.Application.Features.Utility.Services.Commands.ChangeStatus
{
    public class ChangeStatusHandler<TId> : IRequestHandler<ChangeStatusCommand<TId>, Response<bool>>
    {
        private readonly IExtensionRepository<TId> _extensionRepository;
        public ChangeStatusHandler(IExtensionRepository<TId> extensionRepository)
        {
            _extensionRepository = extensionRepository ?? throw new ArgumentNullException(nameof(extensionRepository));
        }
        public async Task<Response<bool>> Handle(ChangeStatusCommand<TId> request, CancellationToken cancellationToken)
        {
            var result = await _extensionRepository.ChangeStatusRecordAsync(request);
            return result ? SuccessMessage.Update.ToSuccessMessage(result) : ErrorsMessage.FailOnUpdate.ToErrorMessage(result);
        }
    }

}
