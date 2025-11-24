using BDFM.Application.Contracts;
using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.OrganizationalUnits.Commands.DeleteOrganizationalUnit;

public class DeleteOrganizationalUnitCommandHandler : IRequestHandler<DeleteOrganizationalUnitCommand, Response<bool>>
{
    private readonly IBaseRepository<OrganizationalUnit> _repository;
    private readonly ICurrentUserService _currentUserService;

    public DeleteOrganizationalUnitCommandHandler(
        IBaseRepository<OrganizationalUnit> repository,
        ICurrentUserService currentUserService)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
    }

    public async Task<Response<bool>> Handle(DeleteOrganizationalUnitCommand request, CancellationToken cancellationToken)
    {
        // Find the organizational unit to delete
        var organizationalUnit = await _repository.Find(
            ou => ou.Id == request.Id && !ou.IsDeleted,
            cancellationToken: cancellationToken);

        if (organizationalUnit == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        try
        {
            // Perform soft delete
            organizationalUnit.IsDeleted = true;
            organizationalUnit.DeletedAt = DateTime.UtcNow;
            organizationalUnit.DeletedBy = _currentUserService.UserId;
            organizationalUnit.StatusId = Status.InActive;
            organizationalUnit.LastUpdateAt = DateTime.UtcNow;
            organizationalUnit.LastUpdateBy = _currentUserService.UserId;

            var result = _repository.Update(organizationalUnit);

            return result
                ? SuccessMessage.Delete.ToSuccessMessage(true)
                : ErrorsMessage.FailOnDelete.ToErrorMessage(false);
        }
        catch (Exception)
        {
            return ErrorsMessage.FailOnDelete.ToErrorMessage(false);
        }
    }
}
