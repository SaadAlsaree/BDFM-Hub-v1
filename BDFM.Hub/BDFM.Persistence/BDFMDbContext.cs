using BDFM.Domain.Enums;

namespace BDFM.Persistence
{
    public partial class BDFMDbContext : DbContext
    {
        public BDFMDbContext(DbContextOptions<BDFMDbContext> options) : base(options) { }

        #region Core Entities
        public DbSet<User> Users { get; set; }
        public DbSet<OrganizationalUnit> OrganizationalUnits { get; set; }
        public DbSet<Correspondence> Correspondences { get; set; }
        //public DbSet<CorrespondenceTimeline> CorrespondenceTimelines { get; set; }
        public DbSet<CorrespondenceLink> CorrespondenceLinks { get; set; }
        public DbSet<ExternalEntity> ExternalEntities { get; set; }
        public DbSet<MailFile> MailFiles { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<SequentialCounter> SequentialCounters { get; set; }

        // Leave Request Entities
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<LeaveInterruption> LeaveInterruptions { get; set; }
        public DbSet<LeaveCancellation> LeaveCancellations { get; set; }
        public DbSet<LeaveBalanceHistory> LeaveBalanceHistories { get; set; }
        #endregion

        #region Workflow Entities
        public DbSet<WorkflowStep> WorkflowSteps { get; set; }
        public DbSet<WorkflowStepInteraction> WorkflowStepInteractions { get; set; }
        public DbSet<WorkflowStepSecondaryRecipient> WorkflowStepSecondaryRecipients { get; set; }
        public DbSet<RecipientActionLog> RecipientActionLogs { get; set; }
        public DbSet<RelatedPriority> RelatedPriorities { get; set; }
        public DbSet<DraftVersion> DraftVersions { get; set; }
        public DbSet<WorkflowStepTodo> WorkflowStepTodos { get; set; }
        public DbSet<TodoTemplate> TodoTemplates { get; set; }
        #endregion

        #region Security Entities
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<BDFM.Domain.Entities.Security.UserRole> UserRoles { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<UnitPermission> UnitPermissions { get; set; }
        public DbSet<Delegation> Delegations { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        #endregion

        #region Supporting Entities
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<CustomWorkflow> CustomWorkflows { get; set; }
        public DbSet<CustomWorkflowStep> CustomWorkflowSteps { get; set; }
        public DbSet<CorrespondenceTemplate> CorrespondenceTemplates { get; set; }
        public DbSet<PermittedExternalEntityCommunication> PermittedExternalEntityCommunications { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<CorrespondenceTag> CorrespondenceTags { get; set; }
        public DbSet<SystemTagTemplate> SystemTagTemplates { get; set; }
        public DbSet<UserCorrespondenceInteraction> UserCorrespondenceInteractions { get; set; }
        public DbSet<CorrespondenceComment> CorrespondenceComments { get; set; }
        #endregion

        #region Configuration Entities
        public DbSet<SystemIntegrationSetting> SystemIntegrationSettings { get; set; }
        public DbSet<IntegrationActivityLog> IntegrationActivityLogs { get; set; }
        #endregion

        #region Automation Entities
        public DbSet<BusinessRule> BusinessRules { get; set; }
        public DbSet<RuleAction> RuleActions { get; set; }
        public DbSet<RuleCondition> RuleConditions { get; set; }
        public DbSet<AdvancedAlertRule> AdvancedAlertRules { get; set; }
        public DbSet<AdvancedAlertTriggerLog> AdvancedAlertTriggerLogs { get; set; }
        public DbSet<AutomationExecutionLog> AutomationExecutionLogs { get; set; }
        public DbSet<AutomationStepExecutionLog> AutomationStepExecutionLogs { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure entity configurations
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Additional configurations

            // Add unique constraints that might not be covered in individual configurations
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique()
                .HasFilter("\"Email\" IS NOT NULL");

            modelBuilder.Entity<User>()
                .HasIndex(u => u.RfidTagId)
                .IsUnique()
                .HasFilter("\"RfidTagId\" IS NOT NULL");

            modelBuilder.Entity<Correspondence>()
                .HasIndex(c => c.MailNum)
                .IsUnique()
                .HasFilter("\"MailNum\" IS NOT NULL");

            // Tag configurations
            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.Name)
                .IsUnique()
                .HasFilter("\"Name\" IS NOT NULL");

            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.Category);

            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.UsageCount);

            // CorrespondenceTag configurations
            modelBuilder.Entity<CorrespondenceTag>()
                .HasIndex(ct => new { ct.CorrespondenceId, ct.TagId })
                .IsUnique();

            modelBuilder.Entity<CorrespondenceTag>()
                .HasIndex(ct => ct.IsPrivateTag);

            // SystemTagTemplate configurations
            modelBuilder.Entity<SystemTagTemplate>()
                .HasIndex(stt => stt.Name)
                .IsUnique()
                .HasFilter("\"Name\" IS NOT NULL");

            modelBuilder.Entity<SystemTagTemplate>()
                .HasIndex(stt => stt.SortOrder);

            // Common configurations for all auditable entities
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(IAuditableEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasIndex("IsDeleted");

                    modelBuilder.Entity(entityType.ClrType)
                        .HasIndex("StatusId");
                }
            }
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateAuditFields()
        {
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreateAt = now;

                        entry.Entity.StatusId = Status.Active;
                        entry.Entity.IsDeleted = false;
                        break;

                    case EntityState.Modified:
                        entry.Entity.LastUpdateAt = now;

                        // Handle soft delete
                        if (entry.Entity.IsDeleted && entry.Entity.DeletedAt == null)
                        {
                            entry.Entity.DeletedAt = now;
                        }
                        break;
                }
            }
        }


    }
}
