# دليل نظام الإحصائيات والتقارير

## نظرة عامة

نظام الإحصائيات والتقارير يوفر رؤية شاملة لأداء نظام المراسلات وسير العمل. يمكنك من خلاله تتبع المراسلات، تحليل الأداء، وإنشاء تقارير مفصلة.

## المميزات

✅ **إحصائيات شاملة**: تحليل كامل للمراسلات وخطوات العمل
✅ **سلاسل زمنية**: تتبع البيانات عبر الزمن (يومي، أسبوعي، شهري، سنوي)
✅ **تتبع سير العمل**: متابعة حالة المراسلات خطوة بخطوة
✅ **تقارير الأداء**: تقارير مفصلة عن الإنتاجية والكفاءة
✅ **ذاكرة تخزين مؤقت**: أداء سريع باستخدام cache ذكي
✅ **فلاتر متقدمة**: تصفية البيانات حسب التاريخ، النوع، المستخدم، وأكثر

---

## API Endpoints

### 1. نظرة عامة على المراسلات

احصل على إحصائيات شاملة عن المراسلات.

```
GET /api/rag/statistics/correspondences/overview
```

**Query Parameters:**
- `dateFrom` (string, optional): تاريخ البداية (ISO 8601)
- `dateTo` (string, optional): تاريخ النهاية (ISO 8601)
- `correspondenceType` (string, optional): أنواع المراسلات مفصولة بفاصلة (Internal,IncomingExternal,OutgoingExternal)
- `priorityLevel` (string, optional): مستويات الأولوية (Low,Normal,High,Urgent)
- `secrecyLevel` (string, optional): مستويات السرية (None,Secret,TopSecret)
- `userId` (string, optional): معرّف المستخدم
- `includeDeleted` (boolean, optional): تضمين المراسلات المحذوفة

**مثال:**

```bash
curl -X GET "http://localhost:3001/api/rag/statistics/correspondences/overview?dateFrom=2025-01-01&dateTo=2025-01-31"
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "total": 1250,
    "byType": {
      "Internal": 450,
      "IncomingExternal": 500,
      "OutgoingExternal": 300
    },
    "byPriority": {
      "Low": 200,
      "Normal": 750,
      "High": 250,
      "Urgent": 50
    },
    "bySecrecy": {
      "None": 1000,
      "Secret": 200,
      "TopSecret": 50
    },
    "byStatus": {},
    "withAttachments": 600,
    "drafts": 45
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**استخدام JavaScript:**

```javascript
async function getCorrespondenceStats(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `http://localhost:3001/api/rag/statistics/correspondences/overview?${params}`
  );
  const result = await response.json();
  return result.data;
}

// مثال
const stats = await getCorrespondenceStats({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  priorityLevel: 'High,Urgent'
});

console.log(`إجمالي المراسلات: ${stats.total}`);
console.log(`مراسلات عاجلة: ${stats.byPriority.Urgent}`);
```

---

### 2. السلاسل الزمنية للمراسلات

احصل على بيانات المراسلات عبر الزمن.

```
GET /api/rag/statistics/correspondences/time-series
```

**Query Parameters:**
- `period` (string, required): الفترة ('day', 'week', 'month', 'year')
- `dateFrom`, `dateTo`, `correspondenceType`, `priorityLevel`, `userId`, `includeDeleted` (نفس السابق)

**مثال:**

```bash
curl -X GET "http://localhost:3001/api/rag/statistics/correspondences/time-series?period=month&dateFrom=2024-01-01&dateTo=2025-01-31"
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "period": "month",
    "data": [
      { "date": "2024-01", "count": 120 },
      { "date": "2024-02", "count": 135 },
      { "date": "2024-03", "count": 145 },
      { "date": "2024-04", "count": 155 }
    ],
    "total": 555,
    "average": 138.75,
    "trend": "up"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**مثال مع Chart.js:**

```javascript
async function showTimeSeriesChart(period = 'month') {
  const response = await fetch(
    `http://localhost:3001/api/rag/statistics/correspondences/time-series?period=${period}`
  );
  const result = await response.json();
  const data = result.data;

  const ctx = document.getElementById('timeSeriesChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.data.map(d => d.date),
      datasets: [{
        label: 'عدد المراسلات',
        data: data.data.map(d => d.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `المراسلات حسب ${period === 'month' ? 'الشهر' : 'اليوم'}`
        }
      }
    }
  });
}
```

---

### 3. نظرة عامة على سير العمل

احصل على إحصائيات خطوات سير العمل.

```
GET /api/rag/statistics/workflow/overview
```

**Query Parameters:**
- `dateFrom`, `dateTo` (string, optional): نطاق التاريخ
- `status` (string, optional): حالات الخطوات (Pending,InProgress,Completed,Rejected)
- `userId` (string, optional): معرّف المستخدم
- `includeDeleted` (boolean, optional)

**استجابة:**

```json
{
  "success": true,
  "data": {
    "total": 3500,
    "byStatus": {
      "Pending": 450,
      "InProgress": 800,
      "Completed": 2100,
      "Rejected": 150
    },
    "byAction": {
      "RegisterIncoming": 500,
      "RequestApproval": 600,
      "Action": 1200,
      "Send": 800,
      "Archive": 400
    },
    "overdue": 120,
    "timeSensitive": 250,
    "completionRate": 60.0
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 4. تتبع سير العمل لمراسلة

تتبع كامل لحالة مراسلة محددة وخطوات العمل عليها.

```
GET /api/rag/statistics/workflow/tracking/:correspondenceId
```

**مثال:**

```bash
curl -X GET "http://localhost:3001/api/rag/statistics/workflow/tracking/550e8400-e29b-41d4-a716-446655440000"
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "correspondenceId": "550e8400-e29b-41d4-a716-446655440000",
    "correspondence": {
      "mailNum": "2025/123",
      "mailDate": "2025-01-10",
      "subject": "طلب معلومات",
      "correspondenceType": "Internal",
      "priorityLevel": "High"
    },
    "steps": [
      {
        "id": "step-1",
        "actionType": "RegisterIncoming",
        "status": "Completed",
        "fromUserId": "user-1",
        "toPrimaryRecipientId": "user-2",
        "createdAt": "2025-01-10T09:00:00Z",
        "dueDate": "2025-01-12T17:00:00Z",
        "isOverdue": false
      },
      {
        "id": "step-2",
        "actionType": "RequestApproval",
        "status": "InProgress",
        "fromUserId": "user-2",
        "toPrimaryRecipientId": "user-3",
        "createdAt": "2025-01-11T10:00:00Z",
        "dueDate": "2025-01-15T17:00:00Z",
        "isOverdue": false
      },
      {
        "id": "step-3",
        "actionType": "Action",
        "status": "Pending",
        "fromUserId": "user-3",
        "toPrimaryRecipientId": "user-4",
        "createdAt": "2025-01-11T14:00:00Z",
        "dueDate": "2025-01-16T17:00:00Z",
        "isOverdue": false
      }
    ],
    "currentStatus": "InProgress",
    "totalSteps": 3,
    "completedSteps": 1,
    "progressPercentage": 33.33
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**مثال تطبيق:**

```javascript
async function showWorkflowTracking(correspondenceId) {
  const response = await fetch(
    `http://localhost:3001/api/rag/statistics/workflow/tracking/${correspondenceId}`
  );
  const result = await response.json();
  const data = result.data;

  // عرض شريط التقدم
  const progress = data.progressPercentage;
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('progress-text').textContent =
    `${data.completedSteps} من ${data.totalSteps} خطوات مكتملة (${progress.toFixed(0)}%)`;

  // عرض الخطوات
  const stepsContainer = document.getElementById('steps');
  stepsContainer.innerHTML = '';

  data.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = `step step-${step.status.toLowerCase()}`;
    stepDiv.innerHTML = `
      <h4>الخطوة ${index + 1}: ${step.actionType}</h4>
      <p>الحالة: ${step.status}</p>
      <p>الموعد النهائي: ${new Date(step.dueDate).toLocaleDateString('ar-SA')}</p>
      ${step.isOverdue ? '<span class="badge overdue">متأخرة</span>' : ''}
    `;
    stepsContainer.appendChild(stepDiv);
  });
}
```

---

### 5. الخطوات المتأخرة

احصل على قائمة بخطوات العمل المتأخرة.

```
GET /api/rag/statistics/workflow/overdue
```

**Query Parameters:**
- `userId` (string, optional): لتصفية حسب مستخدم معين

**استجابة:**

```json
{
  "success": true,
  "data": [
    {
      "id": "step-123",
      "correspondenceId": "corr-456",
      "actionType": "RequestApproval",
      "status": "InProgress",
      "dueDate": "2025-01-10T17:00:00Z",
      "toPrimaryRecipientId": "user-789",
      "mailNum": "2025/100",
      "subject": "طلب موافقة عاجل",
      "priorityLevel": "Urgent"
    }
  ],
  "count": 1,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 6. تقرير الأداء

تقرير شامل عن أداء النظام خلال فترة محددة.

```
GET /api/rag/statistics/reports/performance
```

**Query Parameters:**
- `startDate` (string, required): تاريخ البداية
- `endDate` (string, required): تاريخ النهاية
- `userId` (string, optional): لتصفية حسب مستخدم معين

**مثال:**

```bash
curl -X GET "http://localhost:3001/api/rag/statistics/reports/performance?startDate=2025-01-01&endDate=2025-01-31"
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "correspondences": {
      "total": 1250,
      "created": 1250,
      "completed": 0,
      "pending": 45
    },
    "workflows": {
      "totalSteps": 3500,
      "completedSteps": 2100,
      "pendingSteps": 450,
      "overdueSteps": 120,
      "completionRate": 60.0
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 7. إنتاجية المستخدم

احصل على إحصائيات إنتاجية مستخدم محدد.

```
GET /api/rag/statistics/users/:userId/productivity
```

**Query Parameters:**
- `startDate` (string, required): تاريخ البداية
- `endDate` (string, required): تاريخ النهاية

**مثال:**

```bash
curl -X GET "http://localhost:3001/api/rag/statistics/users/user-123/productivity?startDate=2025-01-01&endDate=2025-01-31"
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "correspondencesCreated": 45,
    "correspondencesSigned": 30,
    "workflowStepsCompleted": 120,
    "workflowStepsPending": 15,
    "completionRate": 88.89,
    "overdueCount": 3
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 8. مسح الذاكرة المؤقتة

مسح الذاكرة المؤقتة للإحصائيات لإجبار تحديث البيانات.

```
POST /api/rag/statistics/cache/clear
```

**استجابة:**

```json
{
  "success": true,
  "data": {
    "message": "Statistics cache cleared successfully"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## أمثلة عملية

### مثال 1: لوحة تحكم شاملة

```javascript
class StatisticsDashboard {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/rag/statistics';
  }

  async getOverallStats(dateFrom, dateTo) {
    // إحصائيات المراسلات
    const corrStats = await this.fetchJSON(
      `/correspondences/overview?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );

    // إحصائيات سير العمل
    const workflowStats = await this.fetchJSON(
      `/workflow/overview?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );

    // الخطوات المتأخرة
    const overdueSteps = await this.fetchJSON('/workflow/overdue');

    return {
      correspondences: corrStats.data,
      workflow: workflowStats.data,
      overdue: overdueSteps.data
    };
  }

  async getTimeSeries(period, dateFrom, dateTo) {
    const response = await this.fetchJSON(
      `/correspondences/time-series?period=${period}&dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    return response.data;
  }

  async getUserProductivity(userId, startDate, endDate) {
    const response = await this.fetchJSON(
      `/users/${userId}/productivity?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async fetchJSON(endpoint) {
    const response = await fetch(this.baseUrl + endpoint);
    return await response.json();
  }

  // عرض الإحصائيات
  renderDashboard(stats) {
    // إحصائيات المراسلات
    document.getElementById('total-corr').textContent = stats.correspondences.total;
    document.getElementById('with-attachments').textContent = stats.correspondences.withAttachments;
    document.getElementById('drafts').textContent = stats.correspondences.drafts;

    // إحصائيات سير العمل
    document.getElementById('total-steps').textContent = stats.workflow.total;
    document.getElementById('completed-steps').textContent = stats.workflow.byStatus.Completed || 0;
    document.getElementById('overdue-steps').textContent = stats.workflow.overdue;
    document.getElementById('completion-rate').textContent =
      stats.workflow.completionRate.toFixed(1) + '%';

    // عرض المتأخرة
    const overdueList = document.getElementById('overdue-list');
    overdueList.innerHTML = '';
    stats.overdue.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${step.mailNum}</strong>: ${step.subject}
        <span class="badge ${step.priorityLevel.toLowerCase()}">${step.priorityLevel}</span>
      `;
      overdueList.appendChild(li);
    });
  }
}

// الاستخدام
const dashboard = new StatisticsDashboard();

// تحميل إحصائيات الشهر الحالي
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

dashboard.getOverallStats(firstDay, lastDay)
  .then(stats => dashboard.renderDashboard(stats));
```

---

### مثال 2: تطبيق React مع Charts

```jsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';

function StatisticsDashboard() {
  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // تحميل الإحصائيات
      const [corrRes, workflowRes, timeSeriesRes] = await Promise.all([
        fetch('http://localhost:3001/api/rag/statistics/correspondences/overview'),
        fetch('http://localhost:3001/api/rag/statistics/workflow/overview'),
        fetch('http://localhost:3001/api/rag/statistics/correspondences/time-series?period=month')
      ]);

      const corrData = await corrRes.json();
      const workflowData = await workflowRes.json();
      const timeSeriesData = await timeSeriesRes.json();

      setStats({
        correspondences: corrData.data,
        workflow: workflowData.data
      });
      setTimeSeries(timeSeriesData.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (!stats) return <div>لا توجد بيانات</div>;

  // بيانات مخطط الأنواع
  const typeChartData = {
    labels: Object.keys(stats.correspondences.byType),
    datasets: [{
      label: 'المراسلات حسب النوع',
      data: Object.values(stats.correspondences.byType),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  // بيانات مخطط السلسلة الزمنية
  const timeSeriesChartData = {
    labels: timeSeries.data.map(d => d.date),
    datasets: [{
      label: 'عدد المراسلات',
      data: timeSeries.data.map(d => d.count),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  // بيانات مخطط حالات سير العمل
  const workflowStatusChartData = {
    labels: Object.keys(stats.workflow.byStatus),
    datasets: [{
      label: 'خطوات العمل حسب الحالة',
      data: Object.values(stats.workflow.byStatus),
      backgroundColor: [
        '#FFA500',
        '#4169E1',
        '#32CD32',
        '#DC143C'
      ]
    }]
  };

  return (
    <div className="statistics-dashboard">
      <h1>لوحة الإحصائيات</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>إجمالي المراسلات</h3>
          <div className="kpi-value">{stats.correspondences.total}</div>
        </div>
        <div className="kpi-card">
          <h3>إجمالي خطوات العمل</h3>
          <div className="kpi-value">{stats.workflow.total}</div>
        </div>
        <div className="kpi-card">
          <h3>معدل الإنجاز</h3>
          <div className="kpi-value">{stats.workflow.completionRate.toFixed(1)}%</div>
        </div>
        <div className="kpi-card">
          <h3>خطوات متأخرة</h3>
          <div className="kpi-value danger">{stats.workflow.overdue}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h2>المراسلات حسب النوع</h2>
          <Pie data={typeChartData} />
        </div>

        <div className="chart-container">
          <h2>المراسلات عبر الزمن</h2>
          <Line data={timeSeriesChartData} />
        </div>

        <div className="chart-container">
          <h2>حالات خطوات العمل</h2>
          <Bar data={workflowStatusChartData} />
        </div>
      </div>

      <button onClick={loadData} className="refresh-btn">
        تحديث البيانات
      </button>
    </div>
  );
}

export default StatisticsDashboard;
```

---

## الفلاتر المتقدمة

يمكنك دمج عدة فلاتر للحصول على نتائج دقيقة:

```javascript
const filters = {
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
  correspondenceType: 'Internal,IncomingExternal',
  priorityLevel: 'High,Urgent',
  secrecyLevel: 'Secret',
  userId: 'user-123',
  includeDeleted: false
};

const params = new URLSearchParams(filters);
const response = await fetch(
  `http://localhost:3001/api/rag/statistics/correspondences/overview?${params}`
);
```

---

## الذاكرة المؤقتة (Cache)

النظام يستخدم ذاكرة مؤقتة ذكية لتحسين الأداء:

- **المدة الافتراضية**: 5 دقائق
- **التمكين/التعطيل**: متغير البيئة `STATS_CACHE_ENABLED`
- **مسح يدوي**: استخدم endpoint `/statistics/cache/clear`

```env
STATS_CACHE_ENABLED=true
STATS_CACHE_TTL=300  # بالثواني
```

---

## نصائح للأداء الأمثل

1. **استخدم الفلاتر**: حدد نطاق البيانات لتقليل وقت الاستعلام
2. **الذاكرة المؤقتة**: فعّل الـ cache للبيانات المتكررة
3. **الفترات المناسبة**: استخدم 'month' أو 'year' للبيانات الكبيرة
4. **التحديث الدوري**: لا تطلب البيانات بشكل متكرر جداً
5. **Pagination**: للقوائم الطويلة، استخدم limit و offset

---

## الأسئلة الشائعة

### هل يؤثر النظام على أداء قاعدة البيانات؟

النظام مُحسّن مع استخدام indexes و cache لتقليل الحمل على قاعدة البيانات.

### هل يمكن تصدير التقارير؟

حالياً، يمكنك استخدام البيانات المُرجعة لإنشاء تقارير PDF أو Excel من جهة العميل.

### كيف أحصل على بيانات لحظية؟

امسح الـ cache ثم اطلب البيانات مرة أخرى.

### هل يمكن إضافة إحصائيات مخصصة؟

نعم، يمكنك تعديل `StatisticsService` لإضافة استعلامات مخصصة.

---

## الدعم الفني

للإبلاغ عن مشاكل أو طلب ميزات جديدة، يُرجى فتح Issue في المستودع على GitHub.
