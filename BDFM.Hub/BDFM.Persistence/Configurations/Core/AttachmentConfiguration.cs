using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
    {
        public void Configure(EntityTypeBuilder<Attachment> builder)
        {
            // Primary Key
            builder.HasKey(a => a.Id);

            // Indices
            builder.HasIndex(a => a.PrimaryTableId);
            builder.HasIndex(a => a.TableName);


            // Composite index for faster lookup by table and ID
            builder.HasIndex(a => new { a.TableName, a.PrimaryTableId });


            // Filter soft-deleted entities
            builder.HasQueryFilter(a => !a.IsDeleted);
        }
    }
}