# خدمة تتبع التاريخ الكامل (Audit Trail Service)

## نظرة عامة

خدمة `AuditTrailService` هي خدمة متخصصة لتتبع التاريخ الكامل للمراسلات وجلب سجل الإجراءات الداخلية. توفر هذه الخدمة واجهات برمجة شاملة لمراقبة وتحليل جميع الإجراءات التي تتم على المراسلات.

## الميزات الرئيسية

### 1. جلب سجل الإجراءات الداخلية

-  جلب كامل سجل الإجراءات لمراسلة معينة
-  دعم الفلترة حسب التاريخ ونوع الإجراء
-  إمكانية تضمين أو استبعاد تفاصيل المستخدم

### 2. إحصائيات متقدمة

-  إحصائيات الإجراءات حسب النوع
-  إحصائيات الإجراءات حسب المستخدم
-  إحصائيات الإجراءات حسب اليوم والشهر
-  حساب النسب المئوية والتوزيع

### 3. واجهات API

-  `GET /BDFM/v1/api/AuditLog/GetCorrespondenceAuditTrail/{correspondenceId}`
-  `GET /BDFM/v1/api/AuditLog/GetCorrespondenceAuditStatistics/{correspondenceId}`

## الاستخدام

### 1. جلب سجل الإجراءات

```csharp
// استخدام الخدمة مباشرة
var auditTrailService = serviceProvider.GetService<IAuditTrailService>();
var auditLogs = await auditTrailService.GetCorrespondenceAuditTrailAsync(correspondenceId);

// استخدام MediatR
var query = new GetCorrespondenceAuditTrailQuery
{
    CorrespondenceId = correspondenceId,
    FromDate = DateTime.Now.AddDays(-30),
    ToDate = DateTime.Now,
    ActionTypes = new List<string> { "Create", "Update", "View" }
};
var result = await mediator.Send(query);
```

### 2. جلب الإحصائيات

```csharp
// استخدام MediatR
var query = new GetCorrespondenceAuditStatisticsQuery
{
    CorrespondenceId = correspondenceId
};
var statistics = await mediator.Send(query);
```

## بنية البيانات

### CorrespondenceAuditTrailViewModel

```csharp
public class CorrespondenceAuditTrailViewModel
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public DateTime Timestamp { get; set; }
    public string Action { get; set; }
    public string? AffectedEntity { get; set; }
    public Guid? AffectedEntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string TimeAgo { get; set; } // الوقت المنقضي بالعربية
    public string ActionDisplayName { get; set; } // نوع الإجراء بالعربية
    public string FormattedDetails { get; set; } // التفاصيل المنسقة
}
```

### CorrespondenceAuditStatisticsViewModel

```csharp
public class CorrespondenceAuditStatisticsViewModel
{
    public Guid CorrespondenceId { get; set; }
    public int TotalActions { get; set; }
    public DateTime? FirstActionDate { get; set; }
    public DateTime? LastActionDate { get; set; }
    public List<ActionTypeStatistics> ActionsByType { get; set; }
    public List<UserActionStatistics> ActionsByUser { get; set; }
    public List<DailyActionStatistics> ActionsByDay { get; set; }
    public List<MonthlyActionStatistics> ActionsByMonth { get; set; }
}
```

## أنواع الإجراءات المدعومة

| الإجراء  | الاسم العربي |
| -------- | ------------ |
| Create   | إنشاء        |
| Update   | تحديث        |
| Delete   | حذف          |
| Login    | تسجيل دخول   |
| Logout   | تسجيل خروج   |
| View     | عرض          |
| Download | تحميل        |
| Upload   | رفع          |
| Assign   | تعيين        |
| Forward  | تحويل        |
| Reply    | رد           |
| Approve  | موافقة       |
| Reject   | رفض          |
| Complete | إكمال        |
| Archive  | أرشفة        |
| Restore  | استعادة      |
| Export   | تصدير        |
| Import   | استيراد      |
| Print    | طباعة        |
| Share    | مشاركة       |

## أمثلة الاستخدام

### 1. جلب سجل الإجراءات مع فلترة

```http
GET /BDFM/v1/api/AuditLog/GetCorrespondenceAuditTrail/123e4567-e89b-12d3-a456-426614174000?fromDate=2024-01-01&toDate=2024-12-31&actionTypes=Create,Update,View
```

### 2. جلب إحصائيات الكتاب

```http
GET /BDFM/v1/api/AuditLog/GetCorrespondenceAuditStatistics/123e4567-e89b-12d3-a456-426614174000
```

### 3. استخدام الخدمة في الكود

```csharp
public class SomeService
{
    private readonly IAuditTrailService _auditTrailService;

    public SomeService(IAuditTrailService auditTrailService)
    {
        _auditTrailService = auditTrailService;
    }

    public async Task<CorrespondenceAuditStatistics> GetStatistics(Guid correspondenceId)
    {
        return await _auditTrailService.GetCorrespondenceAuditStatisticsAsync(correspondenceId);
    }

    public async Task<AuditLog?> GetLastAction(Guid correspondenceId)
    {
        return await _auditTrailService.GetLastCorrespondenceActionAsync(correspondenceId);
    }
}
```

## التسجيل في DI Container

تم تسجيل الخدمة في `ApplicationServiceRegistration.cs`:

```csharp
services.AddScoped<IAuditTrailService, AuditTrailService>();
```

## ملاحظات مهمة

1. **الأداء**: الخدمة تستخدم Entity Framework مع Include لتحسين الأداء
2. **الترجمة**: جميع النصوص معروضة باللغة العربية
3. **التوقيت**: يتم حساب الوقت المنقضي تلقائياً
4. **الأمان**: الخدمة تتحقق من وجود الكتاب قبل جلب البيانات
5. **التوسع**: يمكن إضافة أنواع إجراءات جديدة بسهولة

## التطوير المستقبلي

-  إضافة دعم للتصدير إلى Excel/PDF
-  إضافة تنبيهات للإجراءات المهمة
-  دعم البحث المتقدم في التفاصيل
-  إضافة رسوم بيانية للإحصائيات
-  دعم تتبع الإجراءات في الوقت الفعلي
