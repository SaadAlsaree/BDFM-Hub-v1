# Notification Controller Template

This template shows how to implement the NotificationController following the BDFM project conventions.

## Controller Implementation

```csharp
using BDFM.Application.Features.Notifications.Commands.MarkNotificationAsRead;
using BDFM.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;
using BDFM.Application.Features.Notifications.Queries.GetUserNotifications;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Notifications")]
[Permission]
public class NotificationController : Base<NotificationController>
{
    private readonly IMediator _mediator;

    public NotificationController(ILogger<NotificationController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets notifications for the current user
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<UserNotificationVm>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetUserNotifications([FromQuery] GetUserNotificationsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Marks a specific notification as read
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkNotificationAsRead([FromBody] MarkNotificationAsReadCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Marks all notifications as read for the current user
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAllNotificationsAsRead([FromBody] MarkAllNotificationsAsReadCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets unread notification count for the current user
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetUnreadNotificationCount()
    {
        var query = new GetUserNotificationsQuery { IsRead = false, PageSize = 1 };
        var result = await _mediator.Send(query);

        return await Okey(() => Task.FromResult(Response<int>.Success(result.Data?.TotalCount ?? 0)));
    }
}
```

## Required Using Statements

Add these to the top of the controller file:

```csharp
using BDFM.Api.Helpers;
using BDFM.Api.Attributes;
using BDFM.Application.Helper.Pagination;
using DBDFM.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
```

## Service Registration

Add to `ApplicationServiceRegistration.cs`:

```csharp
// Add the new notification service
services.AddScoped<INotificationService, NotificationService>();

// Update the existing CorrespondenceNotificationService registration to include new dependencies
services.AddScoped<ICorrespondenceNotificationService>(provider =>
{
    var hubContext = provider.GetRequiredService<IHubContext<CorrespondenceHub>>();
    var logger = provider.GetRequiredService<ILogger<CorrespondenceNotificationService>>();
    var userCorrespondenceRepo = provider.GetRequiredService<IBaseRepository<UserCorrespondenceInteraction>>();
    var userRepo = provider.GetRequiredService<IBaseRepository<User>>();

    return new CorrespondenceNotificationService(hubContext, logger, userCorrespondenceRepo, userRepo);
});
```

## Frontend Integration Example

```typescript
// Enhanced SignalR hook usage
const { isConnected } = useCorrespondenceSignalR({
   accessToken,
   onInboxUpdate: handleInboxUpdate,
   onCorrespondenceCreated: handleCorrespondenceCreated,
   onCorrespondenceUpdated: handleCorrespondenceUpdated,
   onCorrespondenceDeleted: handleCorrespondenceDeleted,
   onCorrespondenceStatusChanged: handleCorrespondenceStatusChanged,

   // New handlers for enhanced notifications
   onCorrespondenceAssignedToModule: (notification) => {
      toast.success(`New assignment: ${notification.message}`);
      // Refresh module workload or inbox
      refetchModuleCorrespondences();
   },

   onCorrespondenceStatusChangedWithNotification: (notification) => {
      toast.info(`Status update: ${notification.message}`);
      // Update specific correspondence in state
      updateCorrespondenceInState(notification.correspondenceId, notification.newStatus);
   },

   onWorkflowStepCreated: (notification) => {
      // Refresh workflow steps if viewing workflow
      if (isViewingWorkflow) {
         refetchWorkflowSteps();
      }
   }
});

// API calls for notification management
const markAsRead = async (notificationId: string) => {
   await api.post('/BDFM/v1/api/Notification/MarkNotificationAsRead', {
      notificationId
   });
};

const markAllAsRead = async () => {
   await api.post('/BDFM/v1/api/Notification/MarkAllNotificationsAsRead', {});
};

const getNotifications = async (page = 1, pageSize = 20) => {
   const response = await api.get('/BDFM/v1/api/Notification/GetUserNotifications', {
      params: { page, pageSize }
   });
   return response.data;
};
```

## Testing the Implementation

### 1. Test Module Assignment Notifications

```csharp
// Create a workflow step that assigns correspondence to a module
var command = new CreateWorkflowStepCommand
{
    CorrespondenceId = correspondenceId,
    ToPrimaryRecipientType = RecipientTypeEnum.Unit,
    ToPrimaryRecipientId = organizationalUnitId,
    ActionType = ActionTypeEnum.Review,
    InstructionText = "Please review this correspondence"
};

// This should trigger:
// 1. Real-time SignalR notification to all users in the module
// 2. Persistent database notifications for all users in the module
```

### 2. Test User Preference Notifications

```csharp
// Enable notifications for a correspondence
var enableCommand = new ReceiveNotificationsCommand
{
    CorrespondenceId = correspondenceId,
    ReceiveNotifications = true
};

// Change correspondence status
var statusCommand = new ChangeCorrespondenceStatusCommand
{
    CorrespondenceId = correspondenceId,
    NewStatus = CorrespondenceStatusEnum.InProgress
};

// This should trigger:
// 1. General status change notification to all users
// 2. Targeted notification to users with notifications enabled
// 3. Persistent notifications for users with notifications enabled
```

## Implementation Notes

1. **Error Handling**: All notification operations are wrapped in try-catch blocks to prevent failures from affecting core business operations.

2. **Performance**: The system uses efficient queries and batch operations for bulk notification creation.

3. **Security**: All notifications respect the existing permission system and user access controls.

4. **Backward Compatibility**: The enhanced system is fully backward compatible with existing SignalR functionality.

5. **Logging**: Comprehensive logging is included for monitoring and debugging notification delivery.

This template provides a complete implementation guide for the enhanced notification system while following the established BDFM project conventions.
