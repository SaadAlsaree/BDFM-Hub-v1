using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;

namespace BDFM.Domain.Entities.Supporting
{
    public class UserCorrespondenceInteraction : AuditableEntity<Guid>
    {
        public Guid UserId { get; set; }
        public Guid CorrespondenceId { get; set; }
        public bool IsStarred { get; set; } = false;
        public DateTime? PostponedUntil { get; set; } // للبريد المؤجل (Snoozed/Postponed)
        public bool IsPostponed => PostponedUntil.HasValue && PostponedUntil.Value > DateTime.UtcNow;
        public DateTime? LastReadAt { get; set; } // تاريخ آخر قراءة
        public bool IsInTrash { get; set; } = false; // هل الكتاب في المهملات
        public bool IsRead { get; set; }
        public bool ReceiveNotifications { get; set; } = false;

        public virtual Correspondence Correspondence { get; set; } = default!;
        public virtual User User { get; set; } = default!;
    }
}


//var usersToNotifyForThisCorrespondence = await _context.UserCorrespondenceInteractions
//    .Where(uci => uci.CorrespondenceId == correspondenceId && uci.ReceiveNotifications == true)
//    .Select(uci => uci.UserId)
//    .ToListAsync();

//foreach (var userIdToNotify in usersToNotifyForThisCorrespondence)
//{
//    // أرسل الإشعار لهذا المستخدم
//    // (مع التحقق من عدم إرسال إشعار مكرر إذا كان المستخدم مدرجًا بالفعل في القائمة الأولى)
//}
