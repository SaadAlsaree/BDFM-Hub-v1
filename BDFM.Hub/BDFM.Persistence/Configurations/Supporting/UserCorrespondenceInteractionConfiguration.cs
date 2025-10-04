using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class UserCorrespondenceInteractionConfiguration : IEntityTypeConfiguration<UserCorrespondenceInteraction>
    {
        public void Configure(EntityTypeBuilder<UserCorrespondenceInteraction> builder)
        {
            // Primary Key
            builder.HasKey(uci => uci.Id);

            // Composite Unique Index for User-Correspondence pair
            builder.HasIndex(uci => new { uci.UserId, uci.CorrespondenceId }).IsUnique();

            // Individual Indices for performance
            builder.HasIndex(uci => uci.UserId);
            builder.HasIndex(uci => uci.CorrespondenceId);
            builder.HasIndex(uci => uci.IsStarred);
            builder.HasIndex(uci => uci.IsInTrash);
            builder.HasIndex(uci => uci.IsRead);
            builder.HasIndex(uci => uci.PostponedUntil);
            builder.HasIndex(uci => uci.ReceiveNotifications);

            // Properties
            builder.Property(uci => uci.IsStarred).HasDefaultValue(false);
            builder.Property(uci => uci.IsInTrash).HasDefaultValue(false);
            builder.Property(uci => uci.IsRead).HasDefaultValue(false);
            builder.Property(uci => uci.ReceiveNotifications).HasDefaultValue(false);

            // Computed column configuration (IsPostponed is computed, so we ignore it)
            builder.Ignore(uci => uci.IsPostponed);

            // Relationships
            builder.HasOne(uci => uci.User)
                .WithMany(u => u.UserCorrespondenceInteractions)
                .HasForeignKey(uci => uci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(uci => uci.Correspondence)
                .WithMany(c => c.UserCorrespondenceInteractions)
                .HasForeignKey(uci => uci.CorrespondenceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(uci => !uci.IsDeleted);
        }
    }
}