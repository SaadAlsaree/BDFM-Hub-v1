using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDFM.Domain.Entities.Supporting;

public class Announcement : AuditableEntity<Guid>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Variant { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid UserId { get; set; }
    public Guid OrganizationalUnitId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = default!;
    [ForeignKey("OrganizationalUnitId")]
    public virtual OrganizationalUnit OrganizationalUnit { get; set; } = default!;
}
