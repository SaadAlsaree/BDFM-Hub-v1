# Dashboard Feature Documentation

## Overview

The Dashboard feature provides comprehensive analytics and metrics for the BDFM correspondence management system. It offers real-time insights into correspondence processing, workflow efficiency, organizational unit performance, and automation metrics.

## Features

Dashboard Overview - Complete metrics dashboard with:
✅ Unread incoming mail count (filtered by unit)
✅ Total active and total correspondence
✅ Average monthly volume calculation
✅ Correspondence type distribution with percentages
✅ Top 5 organizational units receiving correspondence
✅ Automation performance metrics (success rate & execution time)
✅ Correspondence status distribution
✅ Backlog metrics with overdue tracking
Additional Query Features:
✅ Detailed correspondence metrics with filtering
✅ Backlog details with task-level information
✅ Performance analytics with trends
✅ Quick stats for dashboard cards
🔧 Technical Implementation:
Application Layer:
GetDashboardOverviewQuery & GetDashboardOverviewHandler - Main dashboard logic
GetCorrespondenceMetricsQuery - Detailed correspondence analytics
GetBacklogDetailsQuery - Detailed backlog analysis
GetPerformanceAnalyticsQuery - Advanced performance metrics
Comprehensive ViewModels for all dashboard data
API Layer:
DashboardController - Following your Base<T> pattern
10 endpoints covering all dashboard functionality
Proper authorization with [Permission] attribute
Full Swagger documentation
Extensions & Utilities:
DashboardExtensions - Helper methods for calculations
Support for Arabic month names
Color coding for priorities and statuses
Efficiency score calculations
📋 Available API Endpoints:
GET /Dashboard/GetOverview - Complete dashboard overview
GET /Dashboard/GetCorrespondenceMetrics - Detailed correspondence analytics
GET /Dashboard/GetBacklogDetails - Backlog analysis with task details
GET /Dashboard/GetUnreadCount - Quick unread count
GET /Dashboard/GetTypeDistribution - Correspondence type statistics
GET /Dashboard/GetStatusDistribution - Status distribution
GET /Dashboard/GetTopUnits - Top performing units
GET /Dashboard/GetAutomationPerformance - Automation metrics
GET /Dashboard/GetQuickStats - Summary stats for cards
GET /Dashboard/GetPerformanceAnalytics - Advanced analytics

### 1. Dashboard Overview (`GetDashboardOverview`)

-  **Endpoint**: `GET /BDFM/v1/api/Dashboard/GetOverview`
-  **Description**: Provides a comprehensive overview of all key metrics
-  **Metrics Included**:
   -  Unread incoming mail count
   -  Total active correspondence
   -  Total correspondence count
   -  Average monthly volume
   -  Correspondence type distribution
   -  Top 5 organizational units receiving correspondence
   -  Automation performance metrics
   -  Correspondence status distribution
   -  Backlog metrics with unit breakdown

### 2. Correspondence Metrics (`GetCorrespondenceMetrics`)

-  **Endpoint**: `GET /BDFM/v1/api/Dashboard/GetCorrespondenceMetrics`
-  **Description**: Detailed correspondence analytics with filtering options
-  **Features**:
   -  Monthly volume trends
   -  Type and status distribution
   -  Priority level analysis
   -  Processing time metrics
   -  Completion rates

### 3. Backlog Details (`GetBacklogDetails`)

-  **Endpoint**: `GET /BDFM/v1/api/Dashboard/GetBacklogDetails`
-  **Description**: Detailed backlog analysis with task-level information
-  **Features**:
   -  Task details with overdue tracking
   -  Unit-wise backlog breakdown
   -  Average task age calculation
   -  Time-sensitive task identification

### 4. Performance Analytics (`GetPerformanceAnalytics`)

-  **Endpoint**: `GET /BDFM/v1/api/Dashboard/GetPerformanceAnalytics`
-  **Description**: Advanced performance metrics and trend analysis
-  **Features**:
   -  Processing time analysis
   -  Throughput metrics
   -  Efficiency calculations
   -  Unit and user performance rankings
   -  Trend analysis with growth rates

## API Endpoints

### Core Endpoints

1. **GET /Dashboard/GetOverview**

   -  Parameters: `unitId?`, `startDate?`, `endDate?`, `monthsBack?`
   -  Returns: `DashboardOverviewViewModel`

2. **GET /Dashboard/GetCorrespondenceMetrics**

   -  Parameters: `unitId?`, `startDate?`, `endDate?`, `correspondenceType?`, `status?`
   -  Returns: `CorrespondenceMetricsViewModel`

3. **GET /Dashboard/GetBacklogDetails**

   -  Parameters: `unitId?`, `daysOverdue?`, `status?`, `includeTaskDetails?`
   -  Returns: `BacklogDetailsViewModel`

4. **GET /Dashboard/GetPerformanceAnalytics**
   -  Parameters: `unitId?`, `startDate?`, `endDate?`, `topUnitsCount?`, `includeUserPerformance?`
   -  Returns: `PerformanceAnalyticsViewModel`

### Utility Endpoints

5. **GET /Dashboard/GetUnreadCount**

   -  Parameters: `unitId?`
   -  Returns: `int` (count of unread correspondence)

6. **GET /Dashboard/GetTypeDistribution**

   -  Parameters: `unitId?`, `startDate?`, `endDate?`
   -  Returns: `List<CorrespondenceTypeDistribution>`

7. **GET /Dashboard/GetStatusDistribution**

   -  Parameters: `unitId?`, `startDate?`, `endDate?`
   -  Returns: `List<CorrespondenceStatusDistribution>`

8. **GET /Dashboard/GetTopUnits**

   -  Parameters: `startDate?`, `endDate?`
   -  Returns: `List<UnitCorrespondenceVolume>`

9. **GET /Dashboard/GetAutomationPerformance**

   -  Parameters: `unitId?`, `startDate?`, `endDate?`
   -  Returns: `AutomationPerformanceMetrics`

10.   **GET /Dashboard/GetQuickStats**
      -  Parameters: `unitId?`
      -  Returns: `QuickStatsViewModel` (summary stats for dashboard cards)

## Query Parameters

### Common Parameters

-  **`unitId`**: Filter results by specific organizational unit
-  **`startDate`**: Start date for date range filtering
-  **`endDate`**: End date for date range filtering

### Specific Parameters

-  **`monthsBack`**: Number of months to look back for historical data (default: 12)
-  **`correspondenceType`**: Filter by specific correspondence type
-  **`status`**: Filter by correspondence status
-  **`daysOverdue`**: Filter backlog tasks by days overdue
-  **`includeTaskDetails`**: Include detailed task information in backlog
-  **`topUnitsCount`**: Number of top-performing units to return
-  **`includeUserPerformance`**: Include user-level performance metrics

## Key Metrics Explained

### Correspondence Metrics

-  **Total Active Correspondence**: Count of correspondence in active processing states
-  **Average Monthly Volume**: Historical average of correspondence per month
-  **Processing Time**: Average time from creation to completion
-  **Completion Rate**: Percentage of correspondence successfully completed

### Backlog Metrics

-  **Total Backlogged Tasks**: Current pending workflow steps
-  **Overdue Tasks**: Tasks past their due date
-  **Average Task Age**: Average days since task creation
-  **Time-Sensitive Tasks**: Tasks marked as time-sensitive

### Automation Metrics

-  **Success Rate**: Percentage of successful automated processes
-  **Average Execution Time**: Average time for automation execution
-  **Processing Volume**: Number of automated processes executed

### Performance Metrics

-  **Efficiency Score**: Composite score based on completion rate and processing time
-  **Throughput**: Volume of correspondence processed per time period
-  **On-Time Delivery Rate**: Percentage of tasks completed before due date

## Data Models

### Core ViewModels

#### ManagerDashboardOverviewViewModel
