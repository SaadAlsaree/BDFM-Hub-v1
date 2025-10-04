namespace BDFM.Application.Features.Security.Delegations.Commands.UpdateDelegation;

public class UpdateDelegationCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    public Guid DelegatorUserId { get; set; }

    [Required]
    public Guid DelegateeUserId { get; set; }

    // Either PermissionId or RoleId must be provided
    public Guid? PermissionId { get; set; }

    public Guid? RoleId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }
}
