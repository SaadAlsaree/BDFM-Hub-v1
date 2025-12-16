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
    /// Applies the correspondence access control rules based on:
    /// 1. Users in the same unit can view all correspondence created in that unit OR forwarded to that unit via WorkflowSteps or Tags
    /// 2. Users can view correspondence forwarded to them personally via WorkflowSteps (IsActive only) or Tags
    /// 3. Users can view correspondence forwarded to their specific unit (not parent/child units) via WorkflowSteps (IsActive only) or Tags
    /// 4. System administrators and managers can view all correspondence in their unit + submodules hierarchically
    /// 5. Creators can always view their own correspondence
    /// </summary>
    public static IQueryable<Correspondence> ApplyCorrespondenceAccessControl(
        this IQueryable<Correspondence> query,
        Guid currentUserId,
        Guid? userUnitId,
        bool isSuAdminOrManager,
        IEnumerable<Guid> hierarchicalUnitIds)
    {
        if (isSuAdminOrManager)
        {
            // SuAdmin/Manager can see:
            // 1. All correspondence in their unit + sub-units hierarchically
            // 2. Correspondence forwarded to them personally via WorkflowSteps (from any unit) or Tags
            // 3. Correspondence forwarded to their unit hierarchy via WorkflowSteps (from any unit) or Tags
            return query.Where(c =>
                // Rule 1: Creator always sees their correspondence
                c.CreateBy == currentUserId ||
                c.CreateByUserId == currentUserId ||

                // Rule 2: All correspondence created in their unit hierarchy
                (c.CorrespondenceOrganizationalUnitId.HasValue &&
                 hierarchicalUnitIds.Contains(c.CorrespondenceOrganizationalUnitId.Value)) ||

                // Rule 3: Workflow-based access - correspondence forwarded to them or their units
                c.WorkflowSteps.Any(ws => ws.IsActive && (
                    // Case A: Forwarded to them personally (from any unit)
                    ws.IsActive == true &&
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                     ws.ToPrimaryRecipientId == currentUserId) ||

                    // Case B: Forwarded to any unit in their hierarchy (from any unit)
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                     hierarchicalUnitIds.Contains(ws.ToPrimaryRecipientId))
                )) ||

                // Rule 4: Tag-based access - correspondence with tags directed to them or their units
                c.Tags.Any(t => (
                    // Case A: Tag directed to them personally
                    t.IsAll == true ||
                    (t.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                     t.ToPrimaryRecipientId == currentUserId) ||

                    // Case B: Tag directed to any unit in their hierarchy
                    (t.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                     hierarchicalUnitIds.Contains(t.ToPrimaryRecipientId ?? Guid.Empty))
                ))
            );
        }
        else if (userUnitId.HasValue)
        {
            var userUnitIdValue = userUnitId.Value;

            // Standard users with unit assignment
            return query.Where(c =>
                // Rule 1: Creator always sees their correspondence (anywhere it was created)
                c.CreateBy == currentUserId ||
                c.CreateByUserId == currentUserId ||

                // Rule 2: Users see correspondence created in their EXACT unit
                // This means if correspondence was created in unit A, only users of unit A can see it
                // (not users in parent or child units)
                (c.CorrespondenceOrganizationalUnitId.HasValue &&
                 c.CorrespondenceOrganizationalUnitId.Value == userUnitIdValue) ||

                // Rule 3: Workflow-based access - users can see correspondence transferred to them
                c.WorkflowSteps.Any(ws => ws.IsActive && (
                    // Case A: Transferred to this specific user personally
                    ws.IsActive == true &&

                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                     ws.ToPrimaryRecipientId == currentUserId) ||

                    // Case B: Transferred to user's EXACT unit (not parent or child units)
                    // If correspondence is transferred to unit A, only users in unit A can see it
                    // Users in parent/child units cannot see it unless it's transferred to them too
                    (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                     ws.ToPrimaryRecipientId == userUnitIdValue)
                )) ||

                // Rule 4: Tag-based access - users can see correspondence with tags directed to them
                c.Tags.Any(t => (
                    // Case A: Tag directed to this specific user personally
                    t.IsAll == true ||
                    (t.ToPrimaryRecipientType == RecipientTypeEnum.User &&
                     t.ToPrimaryRecipientId == currentUserId) ||

                    // Case B: Tag directed to user's EXACT unit (not parent or child units)
                    // If tag is directed to unit A, only users in unit A can see it
                    // Users in parent/child units cannot see it unless tag is directed to them too
                    (t.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                     t.ToPrimaryRecipientId == userUnitIdValue)
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
