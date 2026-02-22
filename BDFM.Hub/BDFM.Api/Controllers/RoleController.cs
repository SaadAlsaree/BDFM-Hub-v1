using BDFM.Application.Features.Security.Roles.Commands.CreateRole;
using BDFM.Application.Features.Security.Roles.Commands.DeleteRole;
using BDFM.Application.Features.Security.Roles.Commands.UpdateRole;
using BDFM.Application.Features.Security.Roles.Queries.GetRoleById;
using BDFM.Application.Features.Security.Roles.Queries.GetRoleList;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Roles")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "SuAdmin, President, Admin")]
[Authorize(Roles = "Admin")]
//[Permission]
public class RoleController : Base<RoleController>
{
    private readonly IMediator _mediator;

    public RoleController(ILogger<RoleController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new role
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateRole([FromBody] CreateRoleCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing role
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateRole([FromBody] UpdateRoleCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.Roles;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a role
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteRole([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRoleCommand { Id = id }));
    }



    /// <summary>
    /// Gets a role by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<RoleViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<RoleViewModel>>> GetRoleById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetRoleByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of roles with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<RoleListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<RoleListViewModel>>>> GetRoleList([FromQuery] GetRoleListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}