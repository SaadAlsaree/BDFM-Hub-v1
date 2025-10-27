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
accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)
```

**النتيجة (تحديث جديد):** جميع المستخدمين في أي وحدة ذات صلة يمكنهم رؤية المراسلة:

-  إذا تم التحويل للوحدة الأم (Parent Unit): جميع مستخدمي الوحدة الأم والوحدات الفرعية يرون المراسلة
-  إذا تم التحويل لوحدة المستخدم مباشرة: جميع مستخدمي الوحدة يرون المراسلة
-  إذا تم التحويل لوحدة فرعية (Sub-unit): جميع مستخدمي الوحدة الأم والوحدات الفرعية يرون المراسلة

**ملاحظة مهمة:** للمستخدمين العاديين (non-Manager/SuAdmin)، يستخدم النظام `GetAllRelatedUnitIdsAsync` التي تشمل:

-  الوحدة الخاصة بالمستخدم
-  جميع الوحدات الأم (بشكل متسلسل حتى الجذر)
-  جميع الوحدات الفرعية (بشكل شجري/هرمي)

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
-  **Method جديد `GetAllRelatedUnitIdsAsync`**: يحصل على جميع الوحدات ذات الصلة (الوحدة الأم + وحدة المستخدم + الوحدات الفرعية) للمستخدمين العاديين
   -  يتم استخدامها بدلاً من `GetAccessibleUnitIdsAsync` للمستخدمين غير الـ Manager/SuAdmin
   -  تضمن رؤية المراسلات المحولة لأي وحدة ذات صلة بالمستخدم (أب، ابن، أو ابن ابن)

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

    // 2. Get appropriate unit IDs based on user role
    // Managers/SuAdmin: Get their unit + sub-units only
    // Standard users: Get all related units (parents + their unit + sub-units)
    var accessibleUnitIds = isSuAdminOrManager
        ? await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken)
        : await _permissionValidationService.GetAllRelatedUnitIdsAsync(cancellationToken);

    var query = _repository.Query();

    // 3. Apply access control
    query = query.ApplyCorrespondenceAccessControl(
        _currentUserService.UserId,
        userUnitId,
        isSuAdminOrManager,
        accessibleUnitIds);

    // 4. Apply additional filters (correspondence type, status, etc.)
    query = query.ApplyFilter(request, _currentUserService.UserId);

    // 5. Continue with ordering, pagination, etc.
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

-  **تاريخ التحديث الأخير**: 2025-10-26
-  **النسخة**: v2.1
-  **المطور**: AI Assistant
-  **التغييرات الأخيرة**:
   -  إضافة `GetAllRelatedUnitIdsAsync` لتمكين المستخدمين من رؤية المراسلات المحولة إلى الوحدات الأم أو الفرعية
   -  تحديث جميع الـ handlers لاستخدام الـ method الجديد
   -  إضافة `GetAllParentUnitIdsAsync` كـ helper method في `PermissionValidationService`
