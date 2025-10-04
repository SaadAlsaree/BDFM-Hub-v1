# Polymorphic Query Solution for WorkflowStepSecondary

## Problem Statement

The `WorkflowStepSecondaryRecipient` entity has a polymorphic relationship where the `RecipientId` can reference either:

-  A `User` entity (when `RecipientType = RecipientTypeEnum.User`)
-  An `OrganizationalUnit` entity (when `RecipientType = RecipientTypeEnum.Unit`)

The challenge was to build a query that can:

1. Filter by `StepId` (required)
2. Optionally filter by `RecipientType` and `RecipientId`
3. Return paginated results with full recipient details
4. Handle the polymorphic nature efficiently

## Solution Architecture

### 1. Enhanced ViewModel Structure

**Updated `WorkflowStepSecondaryRecipientVM`:**

-  Added common recipient fields (`RecipientName`, `RecipientCode`, `RecipientEmail`)
-  Added type-specific DTOs (`UserDetailsDto`, `UnitDetailsDto`)
-  Added audit fields (`CreateAt`, `StatusId`, `StatusName`)

```csharp
public class WorkflowStepSecondaryRecipientVM
{
    public Guid Id { get; set; }
    public Guid StepId { get; set; }
    public RecipientTypeEnum RecipientType { get; set; }
    public Guid RecipientId { get; set; }

    // Common recipient fields
    public string RecipientName { get; set; } = string.Empty; // User.FullName or Unit.UnitName
    public string? RecipientCode { get; set; } // User.UserLogin or Unit.UnitCode
    public string? RecipientEmail { get; set; } // User.Email or Unit.Email

    // Type-specific details
    public UserDetailsDto? UserDetails { get; set; }
    public UnitDetailsDto? UnitDetails { get; set; }

    public string? Purpose { get; set; }
    public string? InstructionText { get; set; }

    // Audit fields
    public DateTime CreateAt { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
```

### 2. Two-Phase Query Strategy

**Phase 1: Base Entity Retrieval**

-  Query `WorkflowStepSecondaryRecipient` with filters
-  Apply pagination
-  Project to basic ViewModel fields

**Phase 2: Polymorphic Detail Population**

-  Group results by `RecipientType`
-  Batch query `User` and `OrganizationalUnit` tables
-  Populate type-specific details efficiently

### 3. Handler Implementation

```csharp
public async Task<Response<PagedResult<WorkflowStepSecondaryRecipientVM>>> Handle(
    GetWorkflowStepSecondaryByStepIdQuery request,
    CancellationToken cancellationToken)
{
    // Build base query with filters
    var query = _repository.Query(wssr => wssr.StepId == request.StepId);

    // Apply optional filters
    if (request.RecipientType.HasValue)
        query = query.Where(wssr => wssr.RecipientType == request.RecipientType.Value);

    if (request.RecipientId.HasValue)
        query = query.Where(wssr => wssr.RecipientId == request.RecipientId.Value);

    // Get count and apply pagination
    var totalCount = await query.CountAsync(cancellationToken);
    var recipientList = await OrderBy(query)
        .Skip((request.Page - 1) * request.PageSize)
        .Take(request.PageSize)
        .Select(Selector)
        .ToListAsync(cancellationToken);

    // Populate polymorphic details
    await PopulateRecipientDetails(recipientList, cancellationToken);

    return Response<PagedResult<WorkflowStepSecondaryRecipientVM>>.Success(pagedResult);
}
```

### 4. Efficient Detail Population

```csharp
private async Task PopulateRecipientDetails(
    List<WorkflowStepSecondaryRecipientVM> recipients,
    CancellationToken cancellationToken)
{
    // Populate status names
    foreach (var recipient in recipients)
        recipient.StatusName = ((Status)recipient.StatusId).GetDisplayName();

    // Group by type for batch processing
    var userRecipients = recipients.Where(r => r.RecipientType == RecipientTypeEnum.User).ToList();
    var unitRecipients = recipients.Where(r => r.RecipientType == RecipientTypeEnum.Unit).ToList();

    // Batch query users
    if (userRecipients.Any())
    {
        var userIds = userRecipients.Select(r => r.RecipientId).ToList();
        var users = await _userRepository
            .Query(u => userIds.Contains(u.Id))
            .Include(u => u.OrganizationalUnit)
            .ToListAsync(cancellationToken);

        // Populate user details...
    }

    // Batch query units
    if (unitRecipients.Any())
    {
        var unitIds = unitRecipients.Select(r => r.RecipientId).ToList();
        var units = await _unitRepository
            .Query(u => unitIds.Contains(u.Id))
            .Include(u => u.ParentUnit)
            .ToListAsync(cancellationToken);

        // Populate unit details...
    }
}
```

## Benefits of This Approach

### 1. **Performance Efficiency**

-  Single query for base data with proper filtering and pagination
-  Batch queries for related data (no N+1 problem)
-  Minimal database round trips

### 2. **Flexibility**

-  Easy to add new recipient types (e.g., `ExternalEntity`)
-  Clean separation of concerns
-  Maintainable code structure

### 3. **Rich Data Model**

-  Complete recipient information in single response
-  Type-specific details when needed
-  Common fields for unified UI handling

### 4. **Proper Error Handling**

-  Graceful handling of missing recipients
-  Comprehensive exception management
-  Consistent response structure

## Usage Examples

### API Endpoints

**Get all secondary recipients for a step:**

```http
GET /BDFM/v1/api/WorkflowStepSecondary/GetWorkflowStepSecondaryByStepId?StepId={guid}&Page=1&PageSize=10
```

**Filter by recipient type:**

```http
GET /BDFM/v1/api/WorkflowStepSecondary/GetWorkflowStepSecondaryByStepId?StepId={guid}&RecipientType=1&Page=1&PageSize=10
```

**Filter by specific recipient:**

```http
GET /BDFM/v1/api/WorkflowStepSecondary/GetWorkflowStepSecondaryByStepId?StepId={guid}&RecipientType=1&RecipientId={guid}&Page=1&PageSize=10
```

### Response Structure

```json
{
   "succeeded": true,
   "data": {
      "data": [
         {
            "id": "guid",
            "stepId": "guid",
            "recipientType": 1,
            "recipientId": "guid",
            "recipientName": "John Doe",
            "recipientCode": "jdoe",
            "recipientEmail": "john.doe@example.com",
            "userDetails": {
               "username": "jdoe",
               "userLogin": "jdoe",
               "fullName": "John Doe",
               "email": "john.doe@example.com",
               "organizationalUnitId": "guid",
               "organizationalUnitName": "IT Department",
               "organizationalUnitCode": "IT",
               "positionTitle": "Developer"
            },
            "unitDetails": null,
            "purpose": "للاطلاع",
            "instructionText": "Review and provide feedback",
            "createAt": "2025-01-27T10:00:00Z",
            "statusId": 1,
            "statusName": "فعال"
         }
      ],
      "totalCount": 15,
      "page": 1,
      "pageSize": 10,
      "totalPages": 2
   }
}
```

## Key Implementation Details

### 1. **Dependency Injection**

The handler requires three repositories:

```csharp
public GetWorkflowStepSecondaryByStepIdHandler(
    IBaseRepository<WorkflowStepSecondaryRecipient> repository,
    IBaseRepository<User> userRepository,
    IBaseRepository<OrganizationalUnit> unitRepository)
```

### 2. **Status Mapping**

Uses the project's standard enum display name pattern:

```csharp
recipient.StatusName = ((Status)recipient.StatusId).GetDisplayName();
```

### 3. **Validation**

Comprehensive validation through `GetWorkflowStepSecondaryByStepIdQueryValidator`:

-  Required `StepId`
-  Valid pagination parameters
-  Proper enum validation
-  GUID validation when provided

### 4. **Controller Integration**

Follows project's controller patterns:

-  Inherits from `Base<TController>`
-  Uses `Okey()` method for error handling
-  Proper route configuration
-  Standard response types

## Future Enhancements

1. **Caching**: Add Redis caching for frequently accessed recipients
2. **Search**: Add full-text search capabilities
3. **Sorting**: Implement dynamic sorting options
4. **Export**: Add export functionality using existing `ExportFileHandler`
5. **Audit**: Enhanced audit logging for recipient access

This solution provides a robust, scalable approach to handling polymorphic queries while maintaining clean architecture principles and optimal performance.
