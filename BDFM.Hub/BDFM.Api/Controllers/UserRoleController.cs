using BDFM.Application.Features.Security.UserRoles.Commands.AssignRolesToUser;
using BDFM.Application.Features.Security.UserRoles.Commands.CreateUserRoles;
using BDFM.Application.Features.Security.UserRoles.Commands.RemoveRoleFromUser;
using BDFM.Application.Features.Security.UserRoles.Queries.GetRolesByUserId;
using BDFM.Application.Features.Security.UserRoles.Queries.GetUsersByRoleId;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("UserRoles")]
//[Permission]
public class UserRoleController : Base<UserRoleController>
{
    private readonly IMediator _mediator;

    public UserRoleController(ILogger<UserRoleController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Assigns roles to a user
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> AssignRolesToUser([FromBody] AssignRolesToUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateUserRole([FromBody] CreateUserRolesCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Removes a role from a user
    /// </summary>
    [HttpDelete]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> RemoveRoleFromUser([FromBody] RemoveRoleFromUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets all roles assigned to a user
    /// </summary>
    [HttpGet("user/{userId}/roles")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<RolesByUserViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<RolesByUserViewModel>>>> GetRolesByUserId([FromRoute] Guid userId, [FromQuery] GetRolesByUserIdQuery query)
    {
        query.UserId = userId;
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets all users that have a specific role
    /// </summary>
    [HttpGet("role/{roleId}/users")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<UsersByRoleViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<UsersByRoleViewModel>>>> GetUsersByRoleId([FromRoute] Guid roleId, [FromQuery] GetUsersByRoleIdQuery query)
    {
        query.RoleId = roleId;
        return await Okey(() => _mediator.Send(query));
    }
}