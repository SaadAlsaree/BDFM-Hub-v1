using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Extensions;

/// <summary>
/// Extension methods for applying correspondence access control rules across all query handlers
/// </summary>
public static class CorrespondenceAccessControlExtensions
{
    /// <summary>
    /// Applies the new correspondence access control rules based on:
    /// 1. Users in same unit can see all correspondence in that unit (without workflow)
    /// 2. Users can see correspondence transferred to them via WorkflowSteps (IsActive only)
    /// 3. Users can see correspondence transferred to ANY related unit (parent units, their unit, or sub-units)
    /// 4. SuAdmin and Manager can see all correspondence in their unit + sub-units hierarchically
    /// 5. Creators always see their own correspondence
    /// </summary>
    public static IQueryable<Correspondence> ApplyCorrespondenceAccessControl(
        this IQueryable<Correspondence> query,
        Guid currentUserId,
        Guid? userUnitId,
        bool isSuAdminOrManager,
        IEnumerable<Guid> accessibleUnitIds)
    {
        if (isSuAdminOrManager)
        {
            // SuAdmin/Manager can see all correspondence in their unit + sub-units
            return query.Where(c =>
                c.CorrespondenceOrganizationalUnitId.HasValue &&
                accessibleUnitIds.Contains(c.CorrespondenceOrganizationalUnitId.Value));
        }
        else if (userUnitId.HasValue)
        {
            // Standard users with unit assignment
            return query.Where(c =>
                // Rule 1: Creator always sees their correspondence
                c.CreateBy == currentUserId ||
                c.CreateByUserId == currentUserId ||

                // Rule 2: All users in same unit see correspondence created in that unit (without workflow required)
                (c.CorrespondenceOrganizationalUnitId.HasValue &&
                 c.CorrespondenceOrganizationalUnitId.Value == userUnitId.Value) ||

                // Rule 3: Workflow-based access (only IsActive WorkflowSteps)
                c.WorkflowSteps.Any(ws => ws.IsActive && (
                    // Case A: Transferred to specific user
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                     ws.ToPrimaryRecipientId == currentUserId) ||

                    // Case B: Transferred to any related unit (parent units + user unit + sub-units)
                    // This allows users to see correspondence transferred to their parent units or sub-units
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                     accessibleUnitIds.Contains(ws.ToPrimaryRecipientId))
                ))
            );
        }
        else
        {
            // User has no unit assignment - only see their own created correspondence
            return query.Where(c =>
                c.CreateBy == currentUserId ||
                c.CreateByUserId == currentUserId);
        }
    }
}
