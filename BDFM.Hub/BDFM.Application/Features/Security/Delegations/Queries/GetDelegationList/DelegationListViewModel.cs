namespace BDFM.Application.Features.Security.Delegations.Queries.GetDelegationList;

public class DelegationListViewModel
{
    public Guid Id { get; set; }
    public Guid DelegatorUserId { get; set; }
    public string DelegatorUserName { get; set; } = string.Empty;
    public Guid DelegateeUserId { get; set; }
    public string DelegateeUserName { get; set; } = string.Empty;
    public Guid? PermissionId { get; set; }
    public string? PermissionName { get; set; }
    public Guid? RoleId { get; set; }
    public string? RoleName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
