# Dashboard Feature

## Overview

The Dashboard feature provides comprehensive analytics and metrics for the BDFM correspondence management system. It offers real-time insights into correspondence processing, workflow efficiency, organizational unit performance, and automation metrics.

## Features

### ✅ Implemented Components

- **Dashboard Overview** - Complete metrics dashboard with real-time data
- **Quick Stats Cards** - Key performance indicators with visual feedback
- **Correspondence Type Distribution** - Pie chart showing distribution by type
- **Correspondence Status Distribution** - Pie chart showing distribution by status
- **Top Units Performance** - Ranking of organizational units by efficiency
- **Automation Performance** - Metrics for automated processes
- **Backlog Overview** - Task backlog analysis and breakdown

### 📊 Key Metrics

- **Unread incoming mail count** (filtered by unit)
- **Total active and total correspondence**
- **Average monthly volume calculation**
- **Correspondence type distribution with percentages**
- **Top 5 organizational units receiving correspondence**
- **Automation performance metrics** (success rate & execution time)
- **Correspondence status distribution**
- **Backlog metrics** with overdue tracking

## Technical Implementation

### Architecture

```
src/features/dashboard/
├── api/
│   └── dashboard.service.ts      # API service layer
├── components/
│   ├── dashboard-overview.tsx    # Main dashboard component
│   ├── dashboard-stats-cards.tsx # Stats cards component
│   ├── correspondence-type-chart.tsx # Type distribution chart
│   ├── top-units-performance.tsx # Units performance ranking
│   └── automation-performance.tsx # Automation metrics
├── types/
│   └── index.ts                  # TypeScript interfaces
├── index.ts                      # Feature exports
└── README.md                     # This file
```

### API Integration

The dashboard integrates with 10 comprehensive API endpoints:

1. **GET /Dashboard/GetOverview** - Complete dashboard overview
2. **GET /Dashboard/GetCorrespondenceMetrics** - Detailed correspondence analytics
3. **GET /Dashboard/GetBacklogDetails** - Backlog analysis with task details
4. **GET /Dashboard/GetUnreadCount** - Quick unread count
5. **GET /Dashboard/GetTypeDistribution** - Correspondence type statistics
6. **GET /Dashboard/GetStatusDistribution** - Status distribution
7. **GET /Dashboard/GetTopUnits** - Top performing units
8. **GET /Dashboard/GetAutomationPerformance** - Automation metrics
9. **GET /Dashboard/GetQuickStats** - Summary stats for cards
10. **GET /Dashboard/GetPerformanceAnalytics** - Advanced analytics

### Data Models

#### Core ViewModels

- `DashboardOverviewViewModel` - Main dashboard data structure
- `CorrespondenceMetricsViewModel` - Detailed correspondence analytics
- `BacklogDetailsViewModel` - Backlog analysis with task information
- `PerformanceAnalyticsViewModel` - Advanced performance metrics
- `QuickStatsViewModel` - Summary statistics for dashboard cards

#### Supporting Types

- `CorrespondenceTypeDistribution` - Type breakdown with percentages
- `UnitCorrespondenceVolume` - Unit performance metrics
- `AutomationPerformanceMetrics` - Automation success rates and timing
- `BacklogTask` - Individual task details with priority and status

## Components

### DashboardOverview

Main dashboard component that orchestrates all other components.

```tsx
import { DashboardOverview } from '@/features/dashboard';

<DashboardOverview
  initialData={data}
  defaultFilters={{ unitId: 'unit-123' }}
  onCardClick={(cardType) => navigate(`/details/${cardType}`)}
  onExport={() => exportDashboardData()}
/>;
```

### DashboardStatsCards

Grid of key performance indicator cards with interactive features.

```tsx
import { DashboardStatsCards } from '@/features/dashboard';

<DashboardStatsCards
  data={quickStats}
  loading={false}
  error={undefined}
  onCardClick={(cardType) => handleCardClick(cardType)}
/>;
```

### CorrespondenceTypeChart

Pie chart visualization for correspondence type distribution.

```tsx
import { CorrespondenceTypeChart } from '@/features/dashboard';

<CorrespondenceTypeChart
  data={typeDistribution}
  title='توزيع أنواع الكتب'
  description='توزيع الكتب حسب النوع'
/>;
```

### TopUnitsPerformance

Ranking component showing best performing organizational units.

```tsx
import { TopUnitsPerformance } from '@/features/dashboard';

<TopUnitsPerformance
  data={topUnits}
  maxUnits={5}
  title='أفضل الوحدات التنظيمية أداءً'
/>;
```

### AutomationPerformance

Comprehensive automation metrics with success rates and performance analysis.

```tsx
import { AutomationPerformance } from '@/features/dashboard';

<AutomationPerformance
  data={automationMetrics}
  title='أداء الأتمتة'
  description='مقاييس أداء العمليات الآلية'
/>;
```

## API Service Usage

### Basic Usage

```tsx
import { dashboardService } from '@/features/dashboard';

// Get complete dashboard overview
const overview = await dashboardService.getDashboardOverview({
  unitId: 'unit-123',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Get quick stats
const stats = await dashboardService.getQuickStats('unit-123');

// Get type distribution
const types = await dashboardService.getTypeDistribution({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

### Server-Side Usage (Next.js)

```tsx
// In a Server Component
async function DashboardPage() {
  const response = await dashboardService.getDashboardOverview();

  if (!response?.succeeded) {
    return <ErrorComponent message={response?.message} />;
  }

  return <DashboardOverview initialData={response.data} />;
}
```

### Client-Side Usage

```tsx
// In a Client Component
'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/features/dashboard';

function ClientDashboard() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const response = await dashboardService.getDashboardOverviewClient();
      setData(response?.data);
      setLoading(false);
    }

    loadData();
  }, []);

  return <DashboardOverview initialData={data} />;
}
```

## Features & Capabilities

### 🎯 Real-time Metrics

- Live correspondence counts and statuses
- Real-time automation performance tracking
- Dynamic backlog analysis with overdue detection
- Unit performance rankings with efficiency scores

### 📈 Advanced Analytics

- Monthly volume trends and patterns
- Processing time analysis and optimization insights
- Completion rate tracking across units
- Automation success rate monitoring

### 🎨 Modern UI/UX

- Responsive design with mobile-first approach
- Arabic language support with proper RTL layout
- Interactive charts and visualizations using Recharts
- Loading states and error handling
- Accessibility compliance with ARIA labels

### 🔧 Developer Experience

- Comprehensive TypeScript interfaces
- Modular component architecture
- Server-side rendering support
- Client-side hydration capabilities
- Error boundaries and fallback UI

## Integration with Existing Pages

The dashboard components are integrated into the existing Next.js parallel routes structure:

```
src/app/(routes)/dashboard/
├── layout.tsx                    # Dashboard layout
├── @task_stats/page.tsx         # Uses DashboardStatsCards
├── @overview_stats/page.tsx     # Uses CorrespondenceTypeChart
├── @performance_stats/page.tsx  # Uses TopUnitsPerformance
└── error.tsx                    # Error boundary
```

## Performance Considerations

### Optimizations

- **Server-side data fetching** for initial page load
- **Client-side caching** for subsequent updates
- **Skeleton loading states** for better perceived performance
- **Error boundaries** for graceful error handling
- **Lazy loading** for non-critical components

### Caching Strategy

- Server-side data is cached at the API level
- Client-side requests include cache headers
- Automatic refresh intervals for real-time data
- Manual refresh capabilities for users

## Future Enhancements

### Planned Features

- **Real-time WebSocket updates** for live metrics
- **Advanced filtering and date range selection**
- **Export functionality** (PDF, Excel, CSV)
- **Custom dashboard layouts** and widget arrangement
- **Drill-down capabilities** for detailed analysis
- **Comparative analytics** across time periods
- **Alert system** for threshold breaches
- **Mobile app integration** for on-the-go access

### Technical Improvements

- **React Query integration** for better data management
- **Virtualization** for large data sets
- **Progressive Web App** capabilities
- **Offline support** with service workers
- **Advanced charting** with D3.js integration

## Dependencies

### Required Packages

```json
{
  "@tabler/icons-react": "^3.x",
  "recharts": "^2.x",
  "tailwindcss": "^3.x",
  "@radix-ui/react-*": "^1.x"
}
```

### UI Components

The dashboard uses the existing Shadcn UI component library:

- Card, CardHeader, CardContent, CardTitle, CardDescription
- Badge, Button, Progress, Skeleton
- Alert, AlertDescription

## Contributing

When contributing to the dashboard feature:

1. **Follow the existing patterns** for component structure
2. **Add comprehensive TypeScript types** for all data models
3. **Include loading and error states** for all components
4. **Write unit tests** for critical functionality
5. **Update documentation** for new features
6. **Test with Arabic content** to ensure RTL support

## Support

For questions or issues related to the dashboard feature:

1. Check the TypeScript interfaces in `types/index.ts`
2. Review the API service documentation
3. Test with the provided mock data
4. Refer to the component examples in this README

The dashboard feature is designed to be comprehensive, performant, and maintainable while providing valuable insights into the BDFM correspondence management system.
