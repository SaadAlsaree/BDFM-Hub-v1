# Daily Performance Summary Feature

This feature provides comprehensive daily performance metrics for the BDFM correspondence management system with real-time data visualization and Arabic localization.

## Overview

The Daily Performance Summary displays today's activities including:

- **Today's Processing Correspondence** - Number of correspondence items being processed today
- **Completion Rate** - Percentage of correspondence completed today
- **Average Processing Time** - Average time (in hours) to complete correspondence
- **Active Units** - List of organizational units that have activity today
- **Velocity Metrics** - Speed and productivity analysis
- **Interactive Charts** - Visual breakdown of correspondence types and completion analysis

## Components

### `DailyPerformanceSummary`

Main component that displays the comprehensive daily performance dashboard.

**Props:**

- `initialData?: DailyPerformanceSummaryViewModel` - Pre-fetched data for SSR
- `unitId?: string` - Filter by specific organizational unit
- `date?: string` - Specific date to analyze (defaults to today)
- `onRefresh?: () => void` - Callback for refresh actions

### `DailyPerformanceSummarySkeleton`

Loading skeleton component with proper layout structure.

## API Integration

### Server-side Method

```typescript
dashboardService.getDailyPerformanceSummary(query?: DailyPerformanceQuery)
```

### Client-side Method

```typescript
dashboardService.getDailyPerformanceSummaryClient(query?: DailyPerformanceQuery)
```

### Query Parameters

```typescript
interface DailyPerformanceQuery {
  unitId?: string; // Filter by organizational unit
  date?: string; // ISO date string (defaults to today)
}
```

## Data Structure

### Main Response

```typescript
interface DailyPerformanceSummaryViewModel {
  date: string; // ISO date string
  dateDisplay: string; // Arabic formatted date
  todaysProcessingCorrespondence: number; // Items being processed today
  completionRate: number; // Completion percentage
  averageProcessingTimeHours: number; // Average processing time
  activeUnitsCount: number; // Number of active units
  activeUnits: DailyUnitPerformance[]; // Unit performance details
  breakdown: DailyBreakdown; // Detailed breakdown
  generatedAt: string; // Generation timestamp
  filteredByUnitId?: string; // Applied unit filter
  filteredByUnitName?: string; // Unit name for display
}
```

### Unit Performance

```typescript
interface DailyUnitPerformance {
  unitId: string;
  unitName: string;
  unitCode: string;
  processingCount: number;
  completedCount: number;
  completionRate: number;
  averageProcessingTimeHours: number;
  activeTasksCount: number;
  performanceStatus: 'ممتاز' | 'جيد' | 'متوسط' | 'ضعيف';
}
```

### Daily Breakdown

```typescript
interface DailyBreakdown {
  incomingCorrespondence: number;
  outgoingCorrespondence: number;
  internalCorrespondence: number;
  completedToday: number;
  startedToday: number;
  overdueCompleted: number;
  onTimeCompleted: number;
  velocity: VelocityMetrics;
}
```

### Velocity Metrics

```typescript
interface VelocityMetrics {
  itemsPerHour: number; // Items completed per hour
  itemsPerDay: number; // Items completed today
  trendDirection: 'Up' | 'Down' | 'Stable'; // Trend compared to yesterday
  trendPercentage: number; // Trend percentage change
  peakProcessingTime: string; // Peak processing hour (HH:mm:ss)
}
```

## Features

### 📊 **Key Performance Indicators**

- Real-time processing count with Arabic number formatting
- Completion rate with progress bar visualization
- Average processing time in hours
- Active units counter

### 📈 **Velocity & Productivity Metrics**

- Items per hour calculation
- Daily throughput analysis
- Trend analysis with visual indicators (Up/Down/Stable arrows)
- Peak processing time identification

### 📋 **Interactive Charts**

- **Correspondence Type Breakdown**: Pie chart showing incoming/outgoing/internal distribution
- **Completion Analysis**: Pie chart showing on-time vs overdue completion
- Color-coded legends with Arabic labels

### 🏢 **Unit Performance Analysis**

- Detailed performance cards for each active unit
- Performance status badges (ممتاز/جيد/متوسط/ضعيف)
- Completion rate progress bars
- Processing time analysis per unit

### 🎨 **UI/UX Features**

- **Arabic Localization**: Complete RTL support with Arabic labels
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Loading States**: Comprehensive skeleton loading
- **Error Handling**: Graceful error display with retry options
- **Real-time Updates**: Auto-refresh capability
- **Color-coded Status**: Performance status with semantic colors

## Performance Status Categories

- **ممتاز (Excellent)**: ≥90% completion rate with ≤24 hours processing time
- **جيد (Good)**: ≥70% completion rate with ≤48 hours processing time
- **متوسط (Average)**: ≥50% completion rate with ≤72 hours processing time
- **ضعيف (Poor)**: Below average thresholds

## Usage Examples

### Basic Usage

```tsx
import { DailyPerformanceSummary } from '@/features/dashboard';

<DailyPerformanceSummary />;
```

### With Unit Filter

```tsx
<DailyPerformanceSummary unitId='12345678-1234-1234-1234-123456789012' />
```

### With Specific Date

```tsx
<DailyPerformanceSummary
  date='2024-01-15'
  onRefresh={() => console.log('Refreshed!')}
/>
```

### Server-side Rendering

```tsx
// In page component
const response = await dashboardService.getDailyPerformanceSummary({
  unitId: searchParams.unitId,
  date: searchParams.date
});

<DailyPerformanceSummary
  initialData={response?.data}
  unitId={searchParams.unitId}
  date={searchParams.date}
/>;
```

## Routing

The feature is available at:

```
/daily-performance
/daily-performance?unitId=<unit-id>
/daily-performance?date=2024-01-15
/daily-performance?unitId=<unit-id>&date=2024-01-15
```

## Integration Points

- **Dashboard Overview**: Can be embedded as a card or section
- **Unit Management**: Integrates with organizational unit data
- **Workflow System**: Tracks task completion and processing times
- **User Management**: Considers user permissions and unit assignments
- **Automation System**: Includes automated process performance

## Technical Implementation

### State Management

- Uses React hooks for local state management
- Implements proper loading and error states
- Handles real-time data updates

### API Integration

- Server-side and client-side data fetching
- Proper error handling and retry logic
- Optimized queries with caching considerations

### Performance Optimizations

- Skeleton loading for better UX
- Efficient re-rendering with proper dependencies
- Lazy loading for non-critical components

### Accessibility

- Semantic HTML structure
- Proper ARIA labels for Arabic content
- Keyboard navigation support
- Screen reader compatibility

## Future Enhancements

- **Historical Comparison**: Compare with previous days/weeks
- **Export Functionality**: PDF/Excel export capabilities
- **Real-time Notifications**: Push notifications for performance alerts
- **Advanced Filtering**: Multiple unit selection, date ranges
- **Performance Predictions**: ML-based performance forecasting
- **Custom Dashboards**: User-configurable dashboard layouts
