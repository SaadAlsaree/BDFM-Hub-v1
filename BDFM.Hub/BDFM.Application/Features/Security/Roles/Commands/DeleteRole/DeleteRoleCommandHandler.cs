using BDFM.Application.Contracts;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

namespace BDFM.Application.Features.Security.Roles.Commands.DeleteRole;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, Response<bool>>
{
    private readonly IExtensionRepository<Guid> _extensionRepository;
    private readonly DeleteRecordHandler<Guid> _deleteRecordHandler;

    public DeleteRoleCommandHandler(IExtensionRepository<Guid> extensionRepository)
    {
        _extensionRepository = extensionRepository;
        _deleteRecordHandler = new DeleteRecordHandler<Guid>(_extensionRepository);
    }

    public async Task<Response<bool>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        return await _deleteRecordHandler.Handle(request, cancellationToken);
    }
}
