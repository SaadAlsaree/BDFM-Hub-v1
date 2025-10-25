# Correspondence Access Control - قواعد التحكم في الوصول للمراسلات

## نظرة عامة

تم تحديث نظام التحكم في الوصول للمراسلات ليتبع القواعد الجديدة التالية:

## القواعد الأساسية

### 1. المراسلات المنشأة ضمن وحدة معينة (بدون تحويل)

**القاعدة:** جميع المستخدمين في نفس الوحدة التي تم إنشاء المراسلة فيها يمكنهم رؤيتها.

```csharp
// المراسلة تحتوي على CorrespondenceOrganizationalUnitId
// جميع المستخدمين في نفس الوحدة يمكنهم رؤيتها
c.CorrespondenceOrganizationalUnitId.HasValue &&
c.CorrespondenceOrganizationalUnitId.Value == userUnitId.Value
```

**ملاحظة مهمة:**

-  الوحدة الأب **لا تستطيع** رؤية المراسلات المنشأة في الوحدات الفرعية (تغيير جوهري عن السلوك السابق)
-  لا يتطلب وجود `WorkflowStep` للوصول إلى المراسلة

### 2. المراسلات المحولة عبر WorkflowSteps

**الشرط الأساسي:** فقط `WorkflowSteps` التي `IsActive == true`

#### حالة أ: التحويل لمستخدم محدد

```csharp
ws.IsActive &&
ws.ToPrimaryRecipientType == RecipientTypeEnum.User &&
ws.ToPrimaryRecipientId == currentUserId
```

**النتيجة:** فقط المستخدم المحدد يمكنه رؤية المراسلة (وليس جميع المستخدمين في وحدته)

#### حالة ب: التحويل لوحدة/جهة

```csharp
ws.IsActive &&
ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
ws.ToPrimaryRecipientId == userUnitId.Value
```

**النتيجة:** جميع المستخدمين في تلك الوحدة يمكنهم رؤية المراسلة

### 3. المستخدمون ذوو الصلاحيات الخاصة (SuAdmin / Manager)

```csharp
var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") ||
                         _currentUserService.HasRole("Manager");
```

**الصلاحيات:**

-  رؤية جميع المراسلات في وحدتهم
-  رؤية جميع المراسلات في الوحدات الفرعية (بشكل شجري/هرمي)

```csharp
if (isSuAdminOrManager)
{
    // Get user's unit + all sub-units hierarchically
    var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

    // Can see all correspondence in their unit + sub-units
    query = query.Where(c =>
        c.CorrespondenceOrganizationalUnitId.HasValue &&
        accessibleUnitIds.Contains(c.CorrespondenceOrganizationalUnitId.Value));
}
```

### 4. المنشئ يرى مراسلاته دائماً

```csharp
c.CreateBy == currentUserId || c.CreateByUserId == currentUserId
```

المستخدم الذي أنشأ المراسلة يمكنه رؤيتها دائماً بغض النظر عن القواعد الأخرى.

## التغييرات المهمة

### ما تم إزالته/تجاهله حالياً:

1. **SecondaryRecipients**: تم تجاهلها في القواعد الجديدة
2. **WorkflowStepInteractions**: تم تجاهلها في القواعد الجديدة
3. **إمكانية رؤية الوحدة الأب للمراسلات الفرعية**: تم إلغاؤها

### الإضافة الجديدة:

-  `CorrespondenceOrganizationalUnitId`: يتم تعيينه تلقائياً عند إنشاء المراسلة من `_currentUserService.OrganizationalUnitId`
-  Extension Method مشترك: `ApplyCorrespondenceAccessControl` في ملف `CorrespondenceAccessControlExtensions.cs`

## Handlers المحدثة

تم تحديث جميع الـ handlers التالية لاستخدام القواعد الجديدة:

1. ✅ `GetUserInboxHandler`
2. ✅ `GetPendingHandler`
3. ✅ `GetCompletedHandler`
4. ✅ `GetProcessingHandler`
5. ✅ `GetIncomingInternalHandler`
6. ✅ `GetOutgoingInternalHandler`
7. ✅ `SearchCorrespondencesHandler`
8. ✅ `GetUserDraftsHandler`

## كيفية الاستخدام

```csharp
public async Task<Response<PagedResult<TViewModel>>> Handle(TQuery request, CancellationToken cancellationToken)
{
    // 1. Get user info and access control parameters
    var userUnitId = _currentUserService.OrganizationalUnitId;
    var isSuAdminOrManager = _currentUserService.HasRole("SuAdmin") ||
                             _currentUserService.HasRole("Manager");
    var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

    var query = _repository.Query();

    // 2. Apply access control
    query = query.ApplyCorrespondenceAccessControl(
        _currentUserService.UserId,
        userUnitId,
        isSuAdminOrManager,
        accessibleUnitIds);

    // 3. Apply additional filters (correspondence type, status, etc.)
    query = query.ApplyFilter(request, _currentUserService.UserId);

    // 4. Continue with ordering, pagination, etc.
    // ...
}
```

## ملاحظات مهمة

1. **الأداء**: استخدام `CorrespondenceOrganizationalUnitId` يحسن الأداء بشكل كبير مقارنة بالاستعلامات المعقدة
2. **الأمان**: القواعد الجديدة أكثر وضوحاً وأماناً
3. **التوسع**: يمكن بسهولة إضافة قواعد جديدة في `CorrespondenceAccessControlExtensions.cs`

## التحقق من الصحة

-  ✅ لا توجد أخطاء في Linter
-  ✅ جميع الـ handlers تستخدم نفس المنطق
-  ✅ الكود متسق ويمكن صيانته بسهولة

## التاريخ

-  **تاريخ التحديث**: 2025-10-24
-  **النسخة**: v2.0
-  **المطور**: AI Assistant
