using BDFM.Application.Features.Security.Permissions.Commands.CreatePermission;
using BDFM.Application.Features.Security.Permissions.Commands.DeletePermission;
using BDFM.Application.Features.Security.Permissions.Commands.UpdatePermission;
using BDFM.Application.Features.Security.Permissions.Queries.GetPermissionById;
using BDFM.Application.Features.Security.Permissions.Queries.GetPermissionList;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Permissions")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "SuAdmin, President, Admin")]
 [Authorize]
//[Permission]
public class PermissionController : Base<PermissionController>
{
    private readonly IMediator _mediator;

    public PermissionController(ILogger<PermissionController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new permission
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreatePermission([FromBody] CreatePermissionCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing permission
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdatePermission([FromBody] UpdatePermissionCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }


    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.Permissions;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a permission
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeletePermission([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeletePermissionCommand { Id = id }));
    }

    /// <summary>
    /// Gets a permission by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PermissionViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PermissionViewModel>>> GetPermissionById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetPermissionByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of permissions with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<PermissionListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<PermissionListViewModel>>>> GetPermissionList([FromQuery] GetPermissionListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}