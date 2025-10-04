using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Security
{
    public class DelegationConfiguration : IEntityTypeConfiguration<Delegation>
    {
        public void Configure(EntityTypeBuilder<Delegation> builder)
        {
            // Primary Key
            builder.HasKey(d => d.Id);

            // Indices
            builder.HasIndex(d => d.DelegatorUserId);
            builder.HasIndex(d => d.DelegateeUserId);
            builder.HasIndex(d => d.PermissionId);
            builder.HasIndex(d => d.RoleId);
            builder.HasIndex(d => d.StartDate);
            builder.HasIndex(d => d.EndDate);
            builder.HasIndex(d => d.IsActive);

            // Properties
            builder.Property(d => d.StartDate).IsRequired();
            builder.Property(d => d.EndDate).IsRequired();

            // Relationships
            // Configure the relationship for User.DelegationsGiven
            builder.HasOne(d => d.DelegatorUser)
                .WithMany(u => u.DelegationsGiven)
                .HasForeignKey(d => d.DelegatorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure the relationship for User.DelegationsReceived
            builder.HasOne(d => d.DelegateeUser)
                .WithMany(u => u.DelegationsReceived)
                .HasForeignKey(d => d.DelegateeUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure optional relationships for Permission and Role
            builder.HasOne(d => d.Permission)
                .WithMany(p => p.Delegations)
                .HasForeignKey(d => d.PermissionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(d => d.Role)
                .WithMany(r => r.Delegations)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(d => !d.IsDeleted);
        }
    }
}