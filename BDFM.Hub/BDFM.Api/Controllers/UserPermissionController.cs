using BDFM.Application.Features.Security.UserPermissions.Commands.AssignPermissionsToUser;
using BDFM.Application.Features.Security.UserPermissions.Commands.CreateUserPermissions;
using BDFM.Application.Features.Security.UserPermissions.Commands.RemovePermissionFromUser;
using BDFM.Application.Features.Security.UserPermissions.Queries.GetPermissionsByUserId;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("UserPermissions")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "SuAdmin, President, Admin")]
[Authorize(Roles = "Admin")]
public class UserPermissionController : Base<UserPermissionController>
{
    private readonly IMediator _mediator;

    public UserPermissionController(ILogger<UserPermissionController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Assigns permissions directly to a user
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> AssignPermissionsToUser([FromBody] AssignPermissionsToUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateUserPermission([FromBody] CreateUserPermissionsCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Removes a permission from a user
    /// </summary>
    [HttpDelete]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> RemovePermissionFromUser([FromBody] RemovePermissionFromUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets all permissions assigned to a specific user
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<PermissionsByUserViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<PermissionsByUserViewModel>>>> GetPermissionsByUserId([FromQuery] GetPermissionsByUserIdQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}