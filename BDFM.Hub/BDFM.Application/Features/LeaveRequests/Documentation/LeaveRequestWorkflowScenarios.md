# سيناريوهات طلب الإجازة ومراحل التحويل

## الفهرس
1. [إنشاء طلب الإجازة](#1-إنشاء-طلب-الإجازة-draft-status)
2. [إرسال الطلب للموافقة](#2-إرسال-الطلب-للموافقة-pendingapproval-status)
3. [سير العمل - مراحل التحويل](#3-سير-العمل---مراحل-التحويل-بين-الجهات)
4. [حالات خاصة بعد الموافقة](#4-بعد-الموافقة---حالات-خاصة)
5. [مخطط تدفق الحالات](#5-مخطط-تدفق-الحالات-state-diagram)
6. [مثال كامل](#6-مثال-كامل-لمسار-إجازة-سنوية-10-أيام)
7. [قواعد إضافية](#7-قواعد-إضافية)
8. [نقاط مهمة في التنفيذ](#8-نقاط-مهمة-في-التنفيذ)

---

## 1. إنشاء طلب الإجازة (Draft Status)

### الخطوات التفصيلية:

1. **الموظف** ينشئ طلب إجازة:
   - يُدخل البيانات التالية:
     - نوع الإجازة (`LeaveType`)
     - تاريخ البداية (`StartDate`)
     - تاريخ النهاية (`EndDate`)
     - السبب (`Reason`)
   
2. **النظام** يقوم بالعمليات التالية:
   - يجلب بيانات الموظف من HR system عبر `IHRIntegrationService`
   - يحسب عدد الأيام المطلوبة تلقائياً (`RequestedDays`)
   - يتحقق من رصيد الإجازات المتاح (`LeaveBalance`)
   - ينشئ رقم طلب فريد (مثل: `LEAVE-2025-001`)
   - **الحالة**: `Draft` (مسودة)

### الكيانات المُنشأة:
- ✅ `LeaveRequest` entity مع `Status = Draft`
- ❌ لا يتم إنشاء `LeaveWorkflowStep` في هذه المرحلة

### البيانات المطلوبة:
```json
{
  "employeeId": "EMP-001",
  "leaveType": "Annual",
  "startDate": "2025-01-15",
  "endDate": "2025-01-24",
  "reason": "إجازة سنوية",
  "organizationalUnitId": "guid-here"
}
```

---

## 2. إرسال الطلب للموافقة (PendingApproval Status)

### الخطوات التفصيلية:

1. **الموظف** يرسل الطلب للموافقة
   
2. **النظام** يقوم بالعمليات التالية:
   - يغير `Status` من `Draft` إلى `PendingApproval`
   - يبحث عن `LeaveWorkflow` المناسب:
     - بناءً على `OrganizationalUnitId` (الوحدة التنظيمية)
     - بناءً على `LeaveType` (نوع الإجازة)
   - ينشئ `LeaveWorkflowStep` الأول من الـ Templates:
     - `LeaveWorkflowStepTemplate` الأول (`StepOrder = 1`)
     - `Status` = `Pending` أو `InProgress`
     - `IsActive` = `true`
     - `Sequence` = 1
   - يرسل إشعار للجهة الأولى (Primary Recipient)

### مثال على LeaveWorkflow:

```yaml
LeaveWorkflow:
  WorkflowName: "مسار إجازة إعتيادية - قسم المبيعات"
  TriggeringUnitId: (قسم المبيعات)
  TriggeringLeaveType: RegularDaily
  StepTemplates:
    - StepOrder: 1
      ActionType: RequestApproval
      TargetType: ManagerOfUnit
      TargetIdentifier: (UnitId of قسم المبيعات)
    
    - StepOrder: 2
      ActionType: RequestApproval
      TargetType: HeadOfDevice
      TargetIdentifier: (UnitId of الجهاز)
    
    - StepOrder: 3
      ActionType: Action
      TargetType: SpecificUnit
      TargetIdentifier: (UnitId of HR Department)
```

---

## 3. سير العمل - مراحل التحويل بين الجهات

### المرحلة 1: المدير المباشر (Step 1)

#### السيناريو A: الموافقة ✅

**الخطوات:**
1. **المدير المباشر** يتلقى الطلب
2. **الإجراء**: `RequestApproval`
3. **القرار**: موافقة
4. **النظام** يقوم بالعمليات التالية:
   - يُنهي `LeaveWorkflowStep` الحالي:
     - `Status` = `Completed`
     - `CompletedAt` = الآن
     - `IsActive` = `false`
   - ينشئ `LeaveWorkflowStep` التالي:
     - `StepOrder` = 2 (من Template)
     - `Status` = `InProgress`
     - `IsActive` = `true`
     - `Sequence` = 2
     - `ActivatedAt` = الآن
   - يرسل إشعار للجهة التالية

#### السيناريو B: الرفض ❌

**الخطوات:**
1. **المدير المباشر** يتلقى الطلب
2. **الإجراء**: `RequestApproval`
3. **القرار**: رفض
4. **النظام** يقوم بالعمليات التالية:
   - يُنهي `LeaveWorkflowStep` الحالي:
     - `Status` = `Completed`
     - `CompletedAt` = الآن
   - يغير `Status` في `LeaveRequest` إلى `Rejected`
   - يسجل `RejectionReason`
   - يرسل إشعار للموظف بالرفض
   - **النهاية**: العملية تتوقف ⛔

#### السيناريو C: إرجاع للموظف ↩️

**الخطوات:**
1. **المدير المباشر** يتلقى الطلب
2. **الإجراء**: `Return`
3. **النظام** يقوم بالعمليات التالية:
   - يُنهي `LeaveWorkflowStep` الحالي
   - يغير `Status` في `LeaveRequest` إلى `Draft`
   - يرسل إشعار للموظف للمراجعة
   - **النتيجة**: الموظف يمكنه التعديل وإعادة الإرسال

#### السيناريو D: إرسال لجهة أخرى 📤

**الخطوات:**
1. **المدير المباشر** يتلقى الطلب
2. **الإجراء**: `SendToInternalReferral` أو `SendToExternalReferral`
3. **النظام** يقوم بالعمليات التالية:
   - يُنهي `LeaveWorkflowStep` الحالي
   - ينشئ `LeaveWorkflowStep` جديد للجهة الجديدة:
     - `ToPrimaryRecipientId` = الجهة الجديدة
     - `ToPrimaryRecipientType` = User أو Unit
     - `Sequence` = Sequence الحالي + 1
   - يبقى `Status` = `PendingApproval`
   - يرسل إشعار للجهة الجديدة

---

### المرحلة 2: رئيس الجهاز (Step 2)

نفس السيناريوهات (A, B, C, D) تتكرر بنفس الطريقة

---

### المرحلة 3: قسم الموارد البشرية (Step 3)

#### السيناريو: إجراء نهائي ✅

**الخطوات:**
1. **قسم الموارد البشرية** يتلقى الطلب
2. **الإجراء**: `Action`
3. **القرار**: موافقة نهائية
4. **النظام** يقوم بالعمليات التالية:
   - يُنهي `LeaveWorkflowStep` الحالي:
     - `Status` = `Completed`
     - `CompletedAt` = الآن
   - يغير `Status` في `LeaveRequest` إلى `Approved`
   - يسجل:
     - `ApprovedAt` = الآن
     - `ApprovedByUserId` = مستخدم الموارد البشرية
     - `ApprovedDays` = الأيام المعتمدة
   - يخصم من رصيد الإجازات:
     ```
     LeaveBalance.UsedBalance += ApprovedDays
     LeaveBalance.AvailableBalance -= ApprovedDays
     ```
   - ينشئ سجل في `LeaveBalanceHistory`:
     - `ChangeType` = "Approval"
     - `ChangeAmount` = -ApprovedDays
     - `PreviousBalance` = الرصيد قبل
     - `NewBalance` = الرصيد بعد
   - يُحدّث نظام HR عبر API:
     - `IHRIntegrationService.UpdateEmployeeLeaveBalance()`

---

## 4. بعد الموافقة - حالات خاصة

### A. قطع الإجازة (Interrupted) ⚠️

#### السيناريو:
موظف لديه إجازة 10 أيام سنوية، ولكن عاد للدوام بعد 5 أيام فقط.

**الخطوات:**
1. **الموظف** أو **المدير** يطلب قطع الإجازة
2. **النظام** يقوم بالعمليات التالية:
   - ينشئ `LeaveInterruption` entity:
     - `InterruptionDate` = تاريخ القطع
     - `ReturnDate` = تاريخ العودة
     - `InterruptionType` = EmployeeReturn أو EarlyEnd
     - `Reason` = سبب القطع
   - يغير `Status` إلى `Interrupted`
   - يُحدّث `ActualEndDate` = ReturnDate
   - يُحسب الأيام الفعلية المستخدمة:
     ```
     ActualDays = (ReturnDate - StartDate) + 1
     ```
   - **يستعيد** الأيام الزائدة:
     ```
     RestoredDays = ApprovedDays - ActualDays
     LeaveBalance.UsedBalance -= RestoredDays
     LeaveBalance.AvailableBalance += RestoredDays
     ```
   - ينشئ سجل في `LeaveBalanceHistory`:
     - `ChangeType` = "Interruption"
     - `ChangeAmount` = +RestoredDays

**مثال:**
- الإجازة المعتمدة: 10 أيام
- الأيام الفعلية: 5 أيام
- الأيام المسترجعة: 5 أيام ✅

---

### B. إلغاء الإجازة (Cancelled) 🚫

#### السيناريو:
موظف يريد إلغاء إجازة تمت الموافقة عليها قبل بدايتها.

**الخطوات:**
1. **الموظف** يطلب إلغاء الإجازة
2. **النظام** يقوم بالعمليات التالية:
   - ينشئ `LeaveCancellation` entity:
     - `CancellationDate` = تاريخ الإلغاء
     - `CancelledByUserId` = الموظف
     - `Reason` = سبب الإلغاء
   - يغير `Status` إلى `Cancelled`
   - يسجل:
     - `CancelledAt` = الآن
     - `CancellationReason` = السبب
   - **يستعيد** جميع الأيام المعتمدة:
     ```
     RestoredDays = ApprovedDays
     LeaveBalance.UsedBalance -= RestoredDays
     LeaveBalance.AvailableBalance += RestoredDays
     ```
   - ينشئ سجل في `LeaveBalanceHistory`:
     - `ChangeType` = "Cancellation"
     - `ChangeAmount` = +RestoredDays
   - يُحدّث نظام HR عبر API

**ملاحظة**: يمكن الإلغاء فقط إذا لم تبدأ الإجازة بعد.

---

### C. انتهاء الإجازة (Completed) ✅

#### السيناريو:
الإجازة انتهت تلقائياً عند الوصول إلى تاريخ النهاية.

**الخطوات:**
1. **النظام** (Background Job) يتحقق يومياً:
   - يبحث عن جميع الإجازات بـ `Status = Approved`
   - يتحقق من `EndDate < اليوم`
2. **النظام** يقوم بالعمليات التالية:
   - يغير `Status` إلى `Completed`
   - يُحسب الاستخدام الفعلي إذا لزم الأمر
   - يسجل `ActualEndDate` إذا لم يكن محدداً

---

## 5. مخطط تدفق الحالات (State Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    Leave Request Lifecycle                  │
└─────────────────────────────────────────────────────────────┘

[Draft] (مسودة)
   │
   │ (إرسال للموافقة)
   ↓
[PendingApproval] (قيد الموافقة)
   │
   ├──────────────────────────────────────────────────┐
   │                                                  │
   ↓ (موافقة نهائية)                                  ↓ (رفض)
[Approved] (موافق عليه)                           [Rejected] (مرفوض)
   │                                                  │
   ├──────────┬──────────┬──────────┐                │
   │          │          │          │                │
   ↓          ↓          ↓          ↓                │
[Completed] [Interrupted] [Cancelled]               │
   │          │          │                           │
   │          │          │                           │
   └──────────┴──────────┴───────────────────────────┘

[إرجاع] ←────────────────────────────────────────────┘
   │
   ↓
[Draft] (العودة للمسودة للتعديل)
```

### حالة WorkflowStep:

```
[Pending] → [InProgress] → [Completed]
              │
              ↓
          (إكمال الخطوة)
              │
              ↓
          (تفعيل الخطوة التالية)
              │
              ↓
          [InProgress] (الخطوة التالية)
```

---

## 6. مثال كامل لمسار إجازة سنوية (10 أيام)

### البيانات الأولية:

- **الموظف**: أحمد محمد
- **القسم**: قسم المبيعات
- **نوع الإجازة**: Annual (سنوية)
- **الفترة**: 2025-01-15 إلى 2025-01-24 (10 أيام)
- **الرصيد الحالي**: 15 يوم سنوي متبقي

---

### المرحلة 1: إنشاء الطلب

```json
{
  "status": "Draft",
  "requestNumber": "LEAVE-2025-001",
  "requestedDays": 10,
  "employeeId": "EMP-001",
  "leaveType": "Annual"
}
```

**النتيجة**: طلب مسودة، لم يُرسل بعد

---

### المرحلة 2: إرسال للموافقة

```json
{
  "status": "PendingApproval",
  "workflowSteps": [
    {
      "sequence": 1,
      "actionType": "RequestApproval",
      "toPrimaryRecipientType": "Unit",
      "toPrimaryRecipientId": "ManagerOfUnit-UnitId",
      "status": "InProgress",
      "isActive": true
    }
  ]
}
```

**الإشعار**: يتم إرسال إشعار لمدير قسم المبيعات

---

### المرحلة 3: موافقة المدير

**الإجراء**: المدير يوافق

```json
{
  "workflowSteps": [
    {
      "sequence": 1,
      "status": "Completed",
      "completedAt": "2025-01-10T10:00:00Z",
      "isActive": false
    },
    {
      "sequence": 2,
      "actionType": "RequestApproval",
      "toPrimaryRecipientType": "Unit",
      "toPrimaryRecipientId": "HeadOfDevice-UnitId",
      "status": "InProgress",
      "isActive": true
    }
  ]
}
```

**الإشعار**: يتم إرسال إشعار لرئيس الجهاز

---

### المرحلة 4: موافقة رئيس الجهاز

**الإجراء**: رئيس الجهاز يوافق

```json
{
  "workflowSteps": [
    {
      "sequence": 2,
      "status": "Completed",
      "completedAt": "2025-01-11T14:00:00Z",
      "isActive": false
    },
    {
      "sequence": 3,
      "actionType": "Action",
      "toPrimaryRecipientType": "Unit",
      "toPrimaryRecipientId": "HR-Department-UnitId",
      "status": "InProgress",
      "isActive": true
    }
  ]
}
```

**الإشعار**: يتم إرسال إشعار لقسم الموارد البشرية

---

### المرحلة 5: إجراء الموارد البشرية

**الإجراء**: قسم الموارد البشرية يوافق نهائياً

```json
{
  "status": "Approved",
  "approvedDays": 10,
  "approvedAt": "2025-01-12T09:00:00Z",
  "approvedByUserId": "HR-USER-001",
  "workflowSteps": [
    {
      "sequence": 3,
      "status": "Completed",
      "completedAt": "2025-01-12T09:00:00Z",
      "isActive": false
    }
  ],
  "leaveBalance": {
    "previousBalance": 15,
    "newBalance": 5,
    "usedBalance": 10
  }
}
```

**النتيجة**: 
- ✅ الإجازة موافق عليها
- ✅ الرصيد: 15 → 5 أيام
- ✅ تم تحديث نظام HR

---

### المرحلة 6 (سيناريو خاص): قطع الإجازة

**السيناريو**: الموظف يعود بعد 5 أيام فقط

**التاريخ**: 2025-01-20 (بعد 5 أيام من البداية)

```json
{
  "status": "Interrupted",
  "actualEndDate": "2025-01-20",
  "interruptions": [
    {
      "interruptionDate": "2025-01-20",
      "returnDate": "2025-01-20",
      "interruptionType": "EmployeeReturn",
      "reason": "انتهى العمل المطلوب",
      "adjustedDays": -5
    }
  ],
  "leaveBalance": {
    "previousBalance": 5,
    "newBalance": 10,
    "restoredDays": 5
  }
}
```

**النتيجة**: 
- ✅ تم قطع الإجازة
- ✅ تم استرجاع 5 أيام
- ✅ الرصيد: 5 → 10 أيام

---

## 7. قواعد إضافية

### صلاحيات الإعتماد (Approval Authority):

| المنصب | الصلاحية | التطبيق |
|--------|---------|---------|
| **الموظف** | 3 أيام شهرياً | من `MonthlyBalance` |
| **المدير** | +2 يوم إضافي | يمكن إضافة يومين خارج صلاحية الموظف |
| **المدير العام** | +5 أيام إضافية | يمكن إضافة 5 أيام خارج صلاحية الموظف |

### أنواع الأرصدة:

| النوع | الوصف | المصدر |
|------|-------|--------|
| **TotalBalance** | الرصيد الكلي | من نظام HR (يتم المزامنة) |
| **MonthlyBalance** | الرصيد الشهري | 3 أيام، يُعاد تلقائياً أول كل شهر |
| **UsedBalance** | المستخدم | يتم الحساب تلقائياً |
| **AvailableBalance** | المتاح | = TotalBalance - UsedBalance |

### أنواع الإجازات:

| النوع | الرمز | القاعدة | الرصيد المستخدم |
|------|------|---------|----------------|
| **اعتيادية/يومية** | RegularDaily | 3 أيام/شهر | MonthlyBalance |
| **سنوية** | Annual | 10 أيام سنوياً | TotalBalance (Annual) |
| **طويلة المدة** | LongTerm | حسب الرصيد الكلي | TotalBalance |
| **دراسية** | Study | حسب القواعد الخاصة | TotalBalance |
| **أمومة** | Maternity | حسب القواعد الخاصة | TotalBalance |
| **عدة** | Mourning | حسب القواعد الخاصة | TotalBalance |
| **مرضية** | Sick | حسب القواعد الخاصة | TotalBalance |

---

## 8. نقاط مهمة في التنفيذ

### 1. إنشاء WorkflowSteps ديناميكياً

- ✅ `LeaveWorkflowStep` يتم إنشاؤه ديناميكياً من `LeaveWorkflowStepTemplate`
- ✅ يتم البحث عن `LeaveWorkflow` المناسب بناءً على:
  - `TriggeringUnitId` (الوحدة)
  - `TriggeringLeaveType` (نوع الإجازة)
- ✅ يتم إنشاء الخطوات حسب `StepOrder` في الـ Templates

### 2. آلية تفعيل الخطوات

- ✅ عند إكمال خطوة (`Status = Completed`):
  - يتم البحث عن الخطوة التالية (`Sequence + 1`)
  - يتم تفعيلها (`IsActive = true`, `Status = InProgress`)
  - يتم إرسال إشعار للمستلم الجديد

### 3. تسلسل الخطوات

- ✅ كل خطوة لها `Sequence` لتحديد الترتيب
- ✅ `Sequence` يبدأ من 1 ويزداد تدريجياً
- ✅ يمكن للخطوات أن تكون متوازية (Future Enhancement)

### 4. الإجراءات المتاحة

كل جهة يمكنها اتخاذ الإجراءات التالية:

| الإجراء | الوصف | النتيجة |
|---------|-------|---------|
| **RequestApproval** | طلب الموافقة | نقل للخطوة التالية |
| **Reject** | الرفض | إنهاء العملية |
| **Return** | إرجاع | العودة للمسودة |
| **SendToInternalReferral** | إحالة داخلية | إنشاء خطوة جديدة |
| **SendToExternalReferral** | إحالة خارجية | إنشاء خطوة جديدة |
| **Action** | إجراء نهائي | الموافقة النهائية |

### 5. التسجيل والتوثيق

- ✅ كل إجراء يتم تسجيله في `LeaveRecipientActionLog`
- ✅ كل تفاعل يتم تسجيله في `LeaveWorkflowStepInteraction`
- ✅ كل تغيير في الرصيد يتم تسجيله في `LeaveBalanceHistory`

### 6. التكامل مع HR System

- ✅ جلب بيانات الموظف: `GetEmployeeData()`
- ✅ جلب رصيد الإجازات: `GetEmployeeLeaveBalances()`
- ✅ تحديث الرصيد بعد الموافقة: `UpdateEmployeeLeaveBalance()`

---

## 9. API Endpoints المستخدمة

### LeaveRequests:

```
POST   /BDFM/v1/api/LeaveRequests/CreateLeaveRequest
PUT    /BDFM/v1/api/LeaveRequests/UpdateLeaveRequest
PUT    /BDFM/v1/api/LeaveRequests/ApproveLeaveRequest
PUT    /BDFM/v1/api/LeaveRequests/RejectLeaveRequest
PUT    /BDFM/v1/api/LeaveRequests/CancelLeaveRequest
PUT    /BDFM/v1/api/LeaveRequests/InterruptLeaveRequest
GET    /BDFM/v1/api/LeaveRequests/GetLeaveRequestById/{id}
GET    /BDFM/v1/api/LeaveRequests/GetAllLeaveRequests
```

### LeaveWorkflowSteps:

```
POST   /BDFM/v1/api/LeaveWorkflowSteps/CreateLeaveWorkflowStep
PUT    /BDFM/v1/api/LeaveWorkflowSteps/UpdateLeaveWorkflowStepStatus
POST   /BDFM/v1/api/LeaveWorkflowSteps/CompleteLeaveWorkflowStep
GET    /BDFM/v1/api/LeaveWorkflowSteps/GetLeaveWorkflowStepById/{id}
GET    /BDFM/v1/api/LeaveWorkflowSteps/GetLeaveWorkflowStepsByRequestId/ByRequestId/{leaveRequestId}
```

### LeaveWorkflows:

```
GET    /BDFM/v1/api/LeaveWorkflows/GetLeaveWorkflowList
GET    /BDFM/v1/api/LeaveWorkflows/GetLeaveWorkflowById/{id}
POST   /BDFM/v1/api/LeaveWorkflows/CreateLeaveWorkflow
PUT    /BDFM/v1/api/LeaveWorkflows/UpdateLeaveWorkflow
DELETE /BDFM/v1/api/LeaveWorkflows/DeleteLeaveWorkflow/{id}
```

---

## 10. الخلاصة

هذا النظام يوفر:

✅ **مرونة كاملة** في تعريف مسارات الموافقة لكل قسم  
✅ **تتبع دقيق** لجميع مراحل الطلب  
✅ **إدارة ذكية** للأرصدة والصلاحيات  
✅ **تكامل سلس** مع نظام HR  
✅ **حالات خاصة** للقطع والإلغاء  
✅ **توثيق شامل** لكل الإجراءات

---

**تاريخ آخر تحديث**: 2025-01-XX  
**الإصدار**: 1.0


