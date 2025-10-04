using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class CorrespondenceCommentConfiguration : IEntityTypeConfiguration<CorrespondenceComment>
    {
        public void Configure(EntityTypeBuilder<CorrespondenceComment> builder)
        {
            // Primary Key
            builder.HasKey(cc => cc.Id);

            // Indices
            builder.HasIndex(cc => cc.CorrespondenceId);
            builder.HasIndex(cc => cc.UserId);
            builder.HasIndex(cc => cc.WorkflowStepId);
            builder.HasIndex(cc => cc.ParentCommentId);
            builder.HasIndex(cc => cc.CreateAt);

            // Composite index for correspondence comments with parent relationship
            builder.HasIndex(cc => new { cc.CorrespondenceId, cc.ParentCommentId });

            // Properties
            builder.Property(cc => cc.Text).IsRequired().HasMaxLength(2000);
            builder.Property(cc => cc.EmployeeName).HasMaxLength(255);
            builder.Property(cc => cc.UserLogin).HasMaxLength(100);
            builder.Property(cc => cc.EmployeeUnitName).HasMaxLength(255);
            builder.Property(cc => cc.EmployeeUnitCode).HasMaxLength(50);
            builder.Property(cc => cc.Visibility).HasConversion<int>();

            // Relationships
            builder.HasOne(cc => cc.Correspondence)
                .WithMany(c => c.Comments)
                .HasForeignKey(cc => cc.CorrespondenceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(cc => cc.User)
                .WithMany(u => u.CreatedComments)
                .HasForeignKey(cc => cc.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cc => cc.WorkflowStep)
                .WithMany(ws => ws.Comments)
                .HasForeignKey(cc => cc.WorkflowStepId)
                .OnDelete(DeleteBehavior.SetNull);

            // Self-referencing relationship for parent/child comments
            builder.HasOne(cc => cc.ParentComment)
                .WithMany(cc => cc.Replies)
                .HasForeignKey(cc => cc.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(cc => !cc.IsDeleted);
        }
    }
}