using BDFM.Application.Contracts;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

namespace BDFM.Application.Features.OrganizationalUnits.Commands.DeleteOrganizationalUnit;

public class DeleteOrganizationalUnitCommandHandler : IRequestHandler<DeleteOrganizationalUnitCommand, Response<bool>>
{
    private readonly IExtensionRepository<Guid> _extensionRepository;
    private readonly DeleteRecordHandler<Guid> _deleteRecordHandler;

    public DeleteOrganizationalUnitCommandHandler(IExtensionRepository<Guid> repository)
    {
        _extensionRepository = repository;
        _deleteRecordHandler = new DeleteRecordHandler<Guid>(repository);
    }

    public async Task<Response<bool>> Handle(DeleteOrganizationalUnitCommand request, CancellationToken cancellationToken)
    {
        // Use the DeleteRecordHandler from IExtensionRepository
        return await _deleteRecordHandler.Handle(request, cancellationToken);
    }
}
