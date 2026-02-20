

using BDFM.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;
using BDFM.Application.Features.Notifications.Commands.MarkNotificationAsRead;
using BDFM.Application.Features.Notifications.Queries.GetUserNotifications;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Notifications")]
[EnableRateLimiting("per-user")]
[Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
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