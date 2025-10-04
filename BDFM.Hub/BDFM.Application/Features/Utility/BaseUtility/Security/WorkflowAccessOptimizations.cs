namespace BDFM.Application.Features.Utility.BaseUtility.Security;

/// <summary>
/// Performance optimization recommendations and extension methods for workflow access control
/// </summary>
public static class WorkflowAccessOptimizations
{
    /// <summary>
    /// Recommended database indexes for optimal workflow access performance.
    /// Add these indexes to your DbContext OnModelCreating method.
    /// </summary>
    public static class RecommendedIndexes
    {
        /// <summary>
        /// Essential indexes for WorkflowStep table to optimize access queries
        /// </summary>
        public static void ConfigureWorkflowStepIndexes(ModelBuilder modelBuilder)
        {
            // Composite index for correspondence + recipient type + recipient ID (most common query pattern)
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStep>()
                .HasIndex(ws => new { ws.CorrespondenceId, ws.ToPrimaryRecipientType, ws.ToPrimaryRecipientId })
                .HasDatabaseName("IX_WorkflowStep_Correspondence_PrimaryRecipient");

            // Index for correspondence ID (used in all workflow queries)
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStep>()
                .HasIndex(ws => ws.CorrespondenceId)
                .HasDatabaseName("IX_WorkflowStep_CorrespondenceId");

            // Index for primary recipient lookups
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStep>()
                .HasIndex(ws => new { ws.ToPrimaryRecipientType, ws.ToPrimaryRecipientId })
                .HasDatabaseName("IX_WorkflowStep_PrimaryRecipient");
        }

        /// <summary>
        /// Essential indexes for WorkflowStepSecondaryRecipient table
        /// </summary>
        public static void ConfigureSecondaryRecipientIndexes(ModelBuilder modelBuilder)
        {
            // Composite index for recipient type + recipient ID (secondary recipient queries)
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStepSecondaryRecipient>()
                .HasIndex(sr => new { sr.RecipientType, sr.RecipientId })
                .HasDatabaseName("IX_WorkflowStepSecondaryRecipient_Recipient");

            // Index for WorkflowStep ID (join optimization)
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStepSecondaryRecipient>()
                .HasIndex(sr => sr.StepId)
                .HasDatabaseName("IX_WorkflowStepSecondaryRecipient_WorkflowStepId");
        }

        /// <summary>
        /// Essential indexes for WorkflowStepInteraction table
        /// </summary>
        public static void ConfigureWorkflowStepInteractionIndexes(ModelBuilder modelBuilder)
        {
            // Composite index for WorkflowStep + InteractingUser (most common query)
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStepInteraction>()
                .HasIndex(wsi => new { wsi.WorkflowStepId, wsi.InteractingUserId })
                .HasDatabaseName("IX_WorkflowStepInteraction_Step_User");

            // Index for InteractingUser (user-based queries)
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStepInteraction>()
                .HasIndex(wsi => wsi.InteractingUserId)
                .HasDatabaseName("IX_WorkflowStepInteraction_InteractingUserId");

            // Unique constraint to prevent duplicate interactions
            modelBuilder.Entity<Domain.Entities.Workflow.WorkflowStepInteraction>()
                .HasIndex(wsi => new { wsi.WorkflowStepId, wsi.InteractingUserId })
                .IsUnique()
                .HasDatabaseName("UX_WorkflowStepInteraction_Step_User_Unique");
        }

        /// <summary>
        /// Essential indexes for Correspondence table
        /// </summary>
        public static void ConfigureCorrespondenceIndexes(ModelBuilder modelBuilder)
        {
            // Index for CreatedBy (creator-based queries)
            modelBuilder.Entity<Domain.Entities.Core.Correspondence>()
                .HasIndex(c => c.CreateBy)
                .HasDatabaseName("IX_Correspondence_CreatedBy");

            // Composite index for common filtering (IsDeleted + CreatedDate)
            modelBuilder.Entity<Domain.Entities.Core.Correspondence>()
                .HasIndex(c => new { c.IsDeleted, c.CreateAt })
                .HasDatabaseName("IX_Correspondence_IsDeleted_CreateAt");
        }

        /// <summary>
        /// Essential indexes for OrganizationalUnit table (hierarchical queries)
        /// </summary>
        public static void ConfigureOrganizationalUnitIndexes(ModelBuilder modelBuilder)
        {
            // Index for ParentUnitId (hierarchical queries)
            modelBuilder.Entity<Domain.Entities.Core.OrganizationalUnit>()
                .HasIndex(ou => ou.ParentUnitId)
                .HasDatabaseName("IX_OrganizationalUnit_ParentUnitId");

            // Composite index for active units
            modelBuilder.Entity<Domain.Entities.Core.OrganizationalUnit>()
                .HasIndex(ou => new { ou.IsDeleted, ou.ParentUnitId })
                .HasDatabaseName("IX_OrganizationalUnit_IsDeleted_ParentUnitId");
        }
    }

    /// <summary>
    /// Performance monitoring and caching recommendations
    /// </summary>
    public static class PerformanceRecommendations
    {
        /// <summary>
        /// Cache user's accessible unit IDs for the duration of the request
        /// to avoid repeated hierarchical queries
        /// </summary>
        public const string CACHE_KEY_USER_ACCESSIBLE_UNITS = "UserAccessibleUnits_{0}";

        /// <summary>
        /// Cache user permissions for short duration to reduce database hits
        /// </summary>
        public const string CACHE_KEY_USER_PERMISSIONS = "UserPermissions_{0}";

        /// <summary>
        /// Recommended cache duration for user permissions (5 minutes)
        /// </summary>
        public static readonly TimeSpan PERMISSION_CACHE_DURATION = TimeSpan.FromMinutes(5);

        /// <summary>
        /// Recommended cache duration for unit hierarchy (15 minutes)
        /// </summary>
        public static readonly TimeSpan UNIT_HIERARCHY_CACHE_DURATION = TimeSpan.FromMinutes(15);
    }

    /// <summary>
    /// Query optimization helper methods (non-extension)
    /// </summary>
    public static class QueryOptimizations
    {
        /// <summary>
        /// Optimized query to check if user has any workflow access to correspondence
        /// Uses EXISTS instead of ANY for better performance
        /// </summary>
        public static IQueryable<Guid> GetAccessibleCorrespondenceIds(
            IQueryable<Domain.Entities.Workflow.WorkflowStep> workflowSteps,
            Guid userId,
            IEnumerable<Guid> accessibleUnitIds)
        {
            var unitIdsList = accessibleUnitIds.ToList();

            return workflowSteps
                .Where(ws =>
                    // Primary recipient is the user
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == userId) ||
                    // Primary recipient is an accessible unit
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && unitIdsList.Contains(ws.ToPrimaryRecipientId)) ||
                    // User is a secondary recipient
                    ws.SecondaryRecipients.Any(sr =>
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == userId) ||
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && unitIdsList.Contains(sr.RecipientId))
                    ) ||
                    // User has WorkflowStepInteraction access
                    ws.Interactions.Any(wsi => wsi.InteractingUserId == userId)
                )
                .Select(ws => ws.CorrespondenceId)
                .Distinct();
        }

        /// <summary>
        /// Batch check for multiple correspondence access
        /// More efficient than checking each correspondence individually
        /// </summary>
        public static async Task<Dictionary<Guid, bool>> BatchCheckCorrespondenceAccessAsync(
            IQueryable<Domain.Entities.Workflow.WorkflowStep> workflowSteps,
            IEnumerable<Guid> correspondenceIds,
            Guid userId,
            IEnumerable<Guid> accessibleUnitIds,
            CancellationToken cancellationToken = default)
        {
            var correspondenceIdsList = correspondenceIds.ToList();
            var unitIdsList = accessibleUnitIds.ToList();

            var accessibleIds = await workflowSteps
                .Where(ws => correspondenceIdsList.Contains(ws.CorrespondenceId))
                .Where(ws =>
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.User && ws.ToPrimaryRecipientId == userId) ||
                    (ws.ToPrimaryRecipientType == Domain.Enums.RecipientTypeEnum.Unit && unitIdsList.Contains(ws.ToPrimaryRecipientId)) ||
                    ws.SecondaryRecipients.Any(sr =>
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.User && sr.RecipientId == userId) ||
                        (sr.RecipientType == Domain.Enums.RecipientTypeEnum.Unit && unitIdsList.Contains(sr.RecipientId))
                    ) ||
                    ws.Interactions.Any(wsi => wsi.InteractingUserId == userId)
                )
                .Select(ws => ws.CorrespondenceId)
                .Distinct()
                .ToListAsync(cancellationToken);

            return correspondenceIdsList.ToDictionary(
                id => id,
                id => accessibleIds.Contains(id)
            );
        }
    }
}

/// <summary>
/// Example DbContext configuration for optimal performance
/// </summary>
public static class DbContextConfigurationExample
{
    /// <summary>
    /// Add this to your DbContext OnModelCreating method for optimal workflow access performance
    /// </summary>
    public static void ConfigureWorkflowAccessIndexes(ModelBuilder modelBuilder)
    {
        // Apply all recommended indexes
        WorkflowAccessOptimizations.RecommendedIndexes.ConfigureWorkflowStepIndexes(modelBuilder);
        WorkflowAccessOptimizations.RecommendedIndexes.ConfigureSecondaryRecipientIndexes(modelBuilder);
        WorkflowAccessOptimizations.RecommendedIndexes.ConfigureWorkflowStepInteractionIndexes(modelBuilder);
        WorkflowAccessOptimizations.RecommendedIndexes.ConfigureCorrespondenceIndexes(modelBuilder);
        WorkflowAccessOptimizations.RecommendedIndexes.ConfigureOrganizationalUnitIndexes(modelBuilder);
    }
}
