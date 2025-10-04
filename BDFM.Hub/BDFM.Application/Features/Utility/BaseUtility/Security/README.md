# Permission Validation System

This document describes the handler-level permission validation system built for the BDFM application using Clean Architecture and CQRS patterns.

## Overview

The permission validation system provides a comprehensive way to validate user permissions at the handler level, ensuring that only authorized users can execute specific commands or queries. The system integrates with the existing security entities and supports:

-  Role-based permissions
-  Hierarchical unit-based permissions (user's unit + all sub-units)
-  Delegated permissions (temporary)
-  Multiple permission validation strategies
-  Override permissions for viewing all data

## Architecture

### Core Components

1. **IPermissionValidationService** - Interface for permission validation
2. **PermissionValidationService** - Implementation that checks permissions from database
3. **SecureHandlerBase** - Base class for handlers requiring permission validation
4. **Security Entities** - Permission, Role, UserRole, RolePermission, UnitPermission, Delegation

### Permission Structure

Permissions follow the format: `{EntityName}|{Action}[|{MetaPermission}]`

Examples:

-  `Correspondence|GetUserInbox`
-  `Correspondence|CreateInternalMail`
-  `User|GetById|ViewOthers`

## Usage Examples

### 1. Query Handler with Permission Validation

```csharp
public class GetUserInboxHandler : GetAllWithCountHandler<Correspondence, InboxItemVm, GetUserInboxQuery>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPermissionValidationService _permissionValidationService;

    private const string PERMISSION_GET_USER_INBOX = "Correspondence|GetUserInbox";

    public GetUserInboxHandler(
        IBaseRepository<Correspondence> repository,
        ICurrentUserService currentUserService,
        IPermissionValidationService permissionValidationService) : base(repository)
    {
        _currentUserService = currentUserService;
        _permissionValidationService = permissionValidationService;
    }

    public async Task<Response<PagedResult<InboxItemVm>>> Handle(GetUserInboxQuery request, CancellationToken cancellationToken)
    {
        // Validate permissions first
        var hasPermission = await _permissionValidationService.HasPermissionAsync(PERMISSION_GET_USER_INBOX, cancellationToken);

        if (!hasPermission)
        {
            return Response<PagedResult<InboxItemVm>>.Fail(
                new List<object> { "Unauthorized access" },
                new MessageResponse { Code = "Error4003", Message = "Access denied." });
        }

        // Continue with normal handler logic...
        var query = _repository.Query();
        // ... rest of implementation
    }
}
```

### 2. Command Handler with Multiple Permission Options

```csharp
public class CreateInternalMailHandler : IRequestHandler<CreateInternalMailCommand, Response<Guid>>
{
    private readonly IPermissionValidationService _permissionValidationService;

    private const string PERMISSION_CREATE_INTERNAL_MAIL = "Correspondence|CreateInternalMail";
    private const string PERMISSION_CREATE_CORRESPONDENCE = "Correspondence|Create";

    public async Task<Response<Guid>> Handle(CreateInternalMailCommand request, CancellationToken cancellationToken)
    {
        // User needs either specific permission or general create permission
        var requiredPermissions = new[]
        {
            PERMISSION_CREATE_INTERNAL_MAIL,
            PERMISSION_CREATE_CORRESPONDENCE
        };

        var hasPermission = await _permissionValidationService.HasAnyPermissionAsync(requiredPermissions, cancellationToken);

        if (!hasPermission)
        {
            return Response<Guid>.Fail(
                new List<object> { "Unauthorized access" },
                new MessageResponse { Code = "Error4003", Message = "Access denied." });
        }

        // Continue with creation logic...
    }
}
```

### 3. Using SecureHandlerBase

```csharp
public class SecureHandler : SecureHandlerBase, IRequestHandler<MyCommand, Response<bool>>
{
    public SecureHandler(
        IPermissionValidationService permissionValidationService,
        ILogger<SecureHandler> logger) : base(permissionValidationService, logger)
    {
    }

    public async Task<Response<bool>> Handle(MyCommand request, CancellationToken cancellationToken)
    {
        return await ExecuteWithPermissionAsync(
            "MyEntity|MyAction",
            async () =>
            {
                // Your business logic here
                return Response<bool>.Success(true);
            },
            cancellationToken);
    }
}
```

### 4. Hierarchical Unit Permission Example

```csharp
public class GetUnitCorrespondenceHandler : IRequestHandler<GetUnitCorrespondenceQuery, Response<List<CorrespondenceVm>>>
{
    private readonly IPermissionValidationService _permissionValidationService;
    private readonly IBaseRepository<Correspondence> _repository;

    public async Task<Response<List<CorrespondenceVm>>> Handle(GetUnitCorrespondenceQuery request, CancellationToken cancellationToken)
    {
        // Check if user can access correspondence for the requested unit
        var canAccessUnit = await _permissionValidationService.CanAccessUnitCorrespondenceAsync(request.UnitId, cancellationToken);

        if (!canAccessUnit)
        {
            return Response<List<CorrespondenceVm>>.Fail(
                new List<object> { "Unauthorized access" },
                new MessageResponse { Code = "Error4003", Message = "You cannot access correspondence for this unit." });
        }

        // Get all accessible unit IDs for filtering
        var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

        // Filter correspondence based on accessible units
        var query = _repository.Query()
            .Where(c => c.WorkflowSteps.Any(ws =>
                (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                ws.SecondaryRecipients.Any(sr => sr.RecipientType == RecipientTypeEnum.Unit && accessibleUnitIds.Contains(sr.RecipientId))));

        // Continue with query execution...
    }
}
```

## Permission Validation Methods

### IPermissionValidationService Methods

#### Basic Permission Validation

-  **HasPermissionAsync(string permissionName)** - Check single permission
-  **HasAnyPermissionAsync(IEnumerable<string> permissionNames)** - Check if user has any of the permissions
-  **HasAllPermissionsAsync(IEnumerable<string> permissionNames)** - Check if user has all permissions
-  **ValidatePermissionAsync(string permissionName)** - Throws exception if not authorized

#### Unit-based Permissions

-  **HasUnitPermissionAsync(string permissionName, Guid unitId)** - Check unit-specific permission
-  **GetAccessibleUnitIdsAsync()** - Get all unit IDs user can access (their unit + sub-units)
-  **CanAccessUnitCorrespondenceAsync(Guid unitId)** - Check if user can access correspondence for a specific unit

#### Workflow-based Permissions

-  **CanAccessCorrespondenceAsync(Guid correspondenceId)** - Check if user can access correspondence through WorkflowStep participation
-  **GetAccessibleWorkflowStepIdsAsync(Guid correspondenceId)** - Get WorkflowStep IDs the user can access for a correspondence
-  **CanAccessWorkflowStepAsync(Guid workflowStepId)** - Check if user can access a specific WorkflowStep

#### User Information

-  **GetUserPermissionsAsync()** - Get all user permissions

### Permission Sources

The system checks permissions from multiple sources:

1. **Role-based permissions** - Permissions assigned to user's roles
2. **Hierarchical unit-based permissions** - Permissions assigned to user's organizational unit and all sub-units
3. **Delegated permissions** - Temporary permissions delegated to the user

### Hierarchical Unit Access

Users can access correspondence for:

-  Their own organizational unit
-  All sub-units within their unit hierarchy
-  **Exception**: Users with roles that have "ViewAll" permissions can access all correspondence regardless of unit hierarchy

### Workflow-based Access Control

The system implements a hierarchical correspondence flow with granular access control:

#### Correspondence Flow Hierarchy

1. **Central Mailbox** (Top Level)

   -  Has rights to: **Read**, **Create**, and **Forward** correspondence
   -  Forwards correspondence to main modules via **WorkflowStep**

2. **Main Module** (Primary Recipients)

   -  Receives correspondence via **WorkflowStep** from central mailbox
   -  Mailbox employee can **read** and **forward** to secondary modules

3. **Secondary Modules** (Sub-modules)
   -  **Cannot read** correspondence initially
   -  **Only gain access** when forwarded via **WorkflowStepInteraction**

#### Access Rules

**To read or take action on correspondence, you must have one of:**

1. **Created the correspondence** (original creator rights)
2. **Received via WorkflowStep** (primary forwarding from central mailbox)
3. **Received via WorkflowStepInteraction** (secondary forwarding within modules)
4. **ViewAll permission** (overrides all restrictions)

#### Participant Types

Users can be involved as:

-  **Primary recipients** (User or Unit) in WorkflowStep
-  **Secondary recipients** (User or Unit) in WorkflowStep
-  **Interaction recipients** (User) in WorkflowStepInteraction
-  Through their **organizational unit hierarchy**

#### Implementation Example

```csharp
public class WorkflowSecureGetUserInboxHandler : GetAllWithCountHandler<Correspondence, InboxItemVm, GetUserInboxQuery>
{
    private readonly IPermissionValidationService _permissionValidationService;

    private async Task<IQueryable<Correspondence>> ApplyWorkflowSecurityFilterAsync(IQueryable<Correspondence> query, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        // Check if user has ViewAll permission (overrides workflow restrictions)
        var canViewAll = await _permissionValidationService.HasPermissionAsync("Correspondence|ViewAll", cancellationToken);
        if (canViewAll) return query;

        // Get user's accessible unit IDs
        var accessibleUnitIds = await _permissionValidationService.GetAccessibleUnitIdsAsync(cancellationToken);

        // Filter based on WorkflowStep participation
        return query.Where(c =>
            // User is primary recipient
            c.WorkflowSteps.Any(ws => ws.ToPrimaryRecipientType == RecipientTypeEnum.User && ws.ToPrimaryRecipientId == userId) ||
            // User's units are primary recipients
            c.WorkflowSteps.Any(ws => ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && accessibleUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
            // User is secondary recipient
            c.WorkflowSteps.Any(ws => ws.SecondaryRecipients.Any(sr =>
                (sr.RecipientType == RecipientTypeEnum.User && sr.RecipientId == userId) ||
                (sr.RecipientType == RecipientTypeEnum.Unit && accessibleUnitIds.Contains(sr.RecipientId))
            ))
        );
    }
}
```

#### Benefits

-  **Granular Security**: Each module/unit sees only their relevant WorkflowSteps
-  **Data Isolation**: Prevents unauthorized access to workflow information
-  **Scalable**: Works with complex organizational hierarchies
-  **Auditable**: Clear trail of who can access what workflow data

## Registration

Add to your DI container:

```csharp
// In ApplicationServiceExtensions.cs
services.AddScoped<IPermissionValidationService, PermissionValidationService>();
```

## Best Practices

1. **Define permission constants** at the top of your handler classes
2. **Validate permissions early** in the Handle method before any business logic
3. **Use descriptive permission names** following the EntityName|Action pattern
4. **Log permission validation attempts** for security auditing
5. **Handle unauthorized access gracefully** with appropriate error messages
6. **Consider using HasAnyPermissionAsync** for flexible permission schemes

## Error Handling

Always handle permission validation failures with appropriate HTTP status codes:

-  **403 Forbidden** - User is authenticated but lacks permission
-  **401 Unauthorized** - User is not authenticated

Example error response:

```csharp
return Response<T>.Fail(
    new List<object> { "Unauthorized access" },
    new MessageResponse { Code = "Error4003", Message = "Access denied. Required permission: {permissionName}" });
```

## Security Considerations

1. **Fail securely** - Default to denying access when in doubt
2. **Log security events** - Track permission validation attempts
3. **Validate on every request** - Don't cache permission results
4. **Use principle of least privilege** - Grant minimal required permissions
5. **Regular permission audits** - Review and cleanup unused permissions

## Integration with Controllers

The permission validation at the handler level complements the existing `[Permission]` attribute at the controller level, providing defense in depth:

```csharp
[Permission("Correspondence|CreateInternalMail")]
public async Task<ObjectResult> CreateInternalMail([FromBody] CreateInternalMailCommand command)
{
    return await Okey(() => _mediator.Send(command));
}
```

Both controller-level and handler-level validation will be enforced, ensuring comprehensive security coverage.

## Performance Optimization

### Database Indexes

For optimal performance, add these indexes to your DbContext:

```csharp
// In your DbContext OnModelCreating method
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Apply workflow access optimization indexes
    WorkflowAccessOptimizations.DbContextConfigurationExample
        .ConfigureWorkflowAccessIndexes(modelBuilder);

    base.OnModelCreating(modelBuilder);
}
```

### Essential Indexes

1. **WorkflowStep Table**:

   -  `IX_WorkflowStep_Correspondence_PrimaryRecipient` (CorrespondenceId, ToPrimaryRecipientType, ToPrimaryRecipientId)
   -  `IX_WorkflowStep_CorrespondenceId` (CorrespondenceId)
   -  `IX_WorkflowStep_PrimaryRecipient` (ToPrimaryRecipientType, ToPrimaryRecipientId)

2. **WorkflowStepInteraction Table**:

   -  `IX_WorkflowStepInteraction_Step_User` (WorkflowStepId, InteractingUserId)
   -  `IX_WorkflowStepInteraction_InteractingUserId` (InteractingUserId)
   -  `UX_WorkflowStepInteraction_Step_User_Unique` (Unique constraint)

3. **Correspondence Table**:
   -  `IX_Correspondence_CreatedBy` (CreatedBy)
   -  `IX_Correspondence_IsDeleted_CreateAt` (IsDeleted, CreateAt)

### Caching Recommendations

-  **User Permissions**: Cache for 5 minutes to reduce database hits
-  **Unit Hierarchy**: Cache for 15 minutes as it changes infrequently
-  **Accessible Unit IDs**: Cache per request to avoid repeated hierarchical queries

### Query Optimization

-  Use `ApplyWorkflowAccessFilterAsync<T>()` for efficient filtering
-  Batch permission checks when possible
-  Leverage the optimized extension methods in `WorkflowAccessOptimizations.QueryOptimizations`

### Monitoring

Monitor these queries for performance:

-  Hierarchical unit traversal queries
-  WorkflowStep access validation queries
-  Permission lookup queries

Consider implementing query result caching for frequently accessed data.
