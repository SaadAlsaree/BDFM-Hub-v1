# Daily Performance Summary Feature

This feature provides comprehensive daily performance metrics for the BDFM correspondence management system.

## Overview

The Daily Performance Summary returns real-time metrics for today's activities including:

1. **Today's Processing Correspondence** - Number of correspondence items being processed today
2. **Completion Rate** - Percentage of correspondence completed today
3. **Average Processing Time** - Average time (in hours) to complete correspondence
4. **Active Units** - List of organizational units that have activity today

## API Endpoint

```
GET /BDFM/v1/api/Dashboard/GetDailyPerformanceSummary
```

### Parameters

-  `unitId` (optional): Filter by specific organizational unit
-  `date` (optional): Specific date to analyze (defaults to today)

### Example Usage

```bash
# Get today's performance for all units
GET /BDFM/v1/api/Dashboard/GetDailyPerformanceSummary

# Get today's performance for a specific unit
GET /BDFM/v1/api/Dashboard/GetDailyPerformanceSummary?unitId=12345678-1234-1234-1234-123456789012

# Get performance for a specific date
GET /BDFM/v1/api/Dashboard/GetDailyPerformanceSummary?date=2024-01-15
```

## Response Structure

### DailyPerformanceSummaryViewModel

```csharp
{
    "date": "2024-01-15T00:00:00Z",
    "dateDisplay": "الإثنين، 15 يناير 2024",
    "todaysProcessingCorrespondence": 25,
    "completionRate": 85.5,
    "averageProcessingTimeHours": 18.5,
    "activeUnitsCount": 8,
    "activeUnits": [
        {
            "unitId": "guid",
            "unitName": "وحدة المراسلات الخارجية",
            "unitCode": "EXT-001",
            "processingCount": 12,
            "completedCount": 10,
            "completionRate": 83.33,
            "averageProcessingTimeHours": 16.5,
            "activeTasksCount": 5,
            "performanceStatus": "جيد"
        }
    ],
    "breakdown": {
        "incomingCorrespondence": 15,
        "outgoingCorrespondence": 8,
        "internalCorrespondence": 2,
        "completedToday": 20,
        "startedToday": 25,
        "overdueCompleted": 3,
        "onTimeCompleted": 17,
        "velocity": {
            "itemsPerHour": 0.83,
            "itemsPerDay": 20,
            "trendDirection": "Up",
            "trendPercentage": 15.5,
            "peakProcessingTime": "14:00:00"
        }
    },
    "generatedAt": "2024-01-15T10:30:00Z",
    "filteredByUnitId": null,
    "filteredByUnitName": null
}
```

## Key Metrics Explained

### Performance Status Categories

-  **ممتاز (Excellent)**: ≥90% completion rate with ≤24 hours processing time
-  **جيد (Good)**: ≥70% completion rate with ≤48 hours processing time
-  **متوسط (Average)**: ≥50% completion rate with ≤72 hours processing time
-  **ضعيف (Poor)**: Below average thresholds

### Velocity Metrics

-  **Items Per Hour**: Average correspondence completed per hour
-  **Items Per Day**: Total correspondence completed today
-  **Trend Direction**: Comparison with yesterday (Up/Down/Stable)
-  **Peak Processing Time**: Hour of day with most completions

### Breakdown Categories

-  **Incoming/Outgoing/Internal**: Distribution by correspondence type
-  **Started vs Completed**: New vs finished items today
-  **Overdue vs On-Time**: Completion timing analysis

## Unit Filtering

When filtering by `unitId`, the system considers correspondence as belonging to a unit if:

1. The correspondence was created by a user from that unit, OR
2. The correspondence has workflow steps assigned to that unit

## Date Handling

-  All times are in UTC
-  Date parameter accepts ISO 8601 format
-  Arabic date formatting is provided in the response
-  Supports historical analysis for any past date

## Performance Considerations

-  Optimized queries with proper Entity Framework includes
-  Parallel processing where possible
-  Efficient filtering to minimize database load
-  Caches unit information to reduce repeated queries

## Integration Notes

This feature integrates with:

-  **Correspondence Management**: Core correspondence data
-  **Workflow System**: Task completion tracking
-  **User Management**: Unit assignments and permissions
-  **Automation System**: Performance trend analysis

## Error Handling

Returns appropriate error responses for:

-  Invalid unit IDs
-  Date parsing errors
-  Database connectivity issues
-  Permission violations
