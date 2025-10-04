using BDFM.Domain.Common;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Core
{
    public class CorrespondenceLink : AuditableEntity<Guid>
    {
        public Guid SourceCorrespondenceId { get; set; } // الكتاب الحالية (التي تقوم بالإشارة)
        public virtual Correspondence SourceCorrespondence { get; set; } = default!;

        public Guid LinkedCorrespondenceId { get; set; } // الكتاب السابقة أو المرتبطة (التي يُشار إليها)
        public virtual Correspondence LinkedCorrespondence { get; set; } = default!;

        public CorrespondenceLinkType LinkType { get; set; } = CorrespondenceLinkType.RefersTo;

        public string? Notes { get; set; } // ملاحظات حول هذا الارتباط المحدد


        // لضمان عدم تكرار نفس الارتباط بنفس النوع
        // يجب إضافة Unique constraint على (SourceCorrespondenceId, LinkedCorrespondenceId, LinkType)
        // يتم ذلك في DbContext باستخدام OnModelCreating
    }
}
