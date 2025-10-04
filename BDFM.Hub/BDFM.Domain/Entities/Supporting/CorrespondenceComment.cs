using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDFM.Domain.Entities.Supporting
{
    public class CorrespondenceComment : AuditableEntity<Guid>
    {
        [Required]
        public Guid CorrespondenceId { get; set; } // الكتاب التي يتعلق بها هذا التعليق
        [ForeignKey("CorrespondenceId")]
        public virtual Correspondence Correspondence { get; set; } = default!;

        // إذا أردت ربط التعليق بخطوة سير عمل معينة (اختياري ولكن قد يكون مفيدًا)
        public Guid? WorkflowStepId { get; set; }
        [ForeignKey("WorkflowStepId")]
        public virtual WorkflowStep? WorkflowStep { get; set; } // التعليق قد يكون مرتبطًا بسياق إحالة معينة

        [Required]
        [MaxLength(2000)] // حد أقصى لطول التعليق
        public string Text { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = default!;
        public string EmployeeName { get; set; } = string.Empty;
        public string UserLogin { get; set; } = string.Empty;
        public string EmployeeUnitName { get; set; } = string.Empty;
        public string EmployeeUnitCode { get; set; } = string.Empty;
        public bool IsEdited { get; set; }
        public bool CanEdit { get; set; } // هل المستخدم الحالي يمكنه تعديل هذا التعليق
        public bool CanDelete { get; set; }

        // لدعم الردود على التعليقات (إنشاء هيكل شجري للتعليقات)
        public Guid? ParentCommentId { get; set; } // إذا كان هذا التعليق ردًا على تعليق آخر
        [ForeignKey("ParentCommentId")]
        public virtual CorrespondenceComment? ParentComment { get; set; }
        public CommentVisibility Visibility { get; set; } = CommentVisibility.InternalUsers;

        public virtual ICollection<CorrespondenceComment> Replies { get; set; } = new HashSet<CorrespondenceComment>();

    }
}
