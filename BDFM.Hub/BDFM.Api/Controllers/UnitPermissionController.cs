using BDFM.Application.Features.Security.UnitPermissions.Commands.AssignPermissionsToUnit;
using BDFM.Application.Features.Security.UnitPermissions.Commands.RemovePermissionFromUnit;
using BDFM.Application.Features.Security.UnitPermissions.Queries.GetPermissionsByUnitId;
using BDFM.Application.Features.Security.UnitPermissions.Queries.GetUnitsByPermissionId;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("UnitPermissions")]
//[Permission]
public class UnitPermissionController : Base<UnitPermissionController>
{
    private readonly IMediator _mediator;

    public UnitPermissionController(ILogger<UnitPermissionController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Assigns permissions to an organizational unit
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> AssignPermissionsToUnit([FromBody] AssignPermissionsToUnitCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Removes a permission from an organizational unit
    /// </summary>
    [HttpDelete]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> RemovePermissionFromUnit([FromBody] RemovePermissionFromUnitCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets all permissions assigned to an organizational unit
    /// </summary>
    [HttpGet("unit/{unitId}/permissions")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<PermissionsByUnitViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<PermissionsByUnitViewModel>>>> GetPermissionsByUnitId([FromRoute] Guid unitId, [FromQuery] GetPermissionsByUnitIdQuery query)
    {
        query.UnitId = unitId;
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets all organizational units that have a specific permission
    /// </summary>
    [HttpGet("permission/{permissionId}/units")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<UnitsByPermissionViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<UnitsByPermissionViewModel>>>> GetUnitsByPermissionId([FromRoute] Guid permissionId, [FromQuery] GetUnitsByPermissionIdQuery query)
    {
        query.PermissionId = permissionId;
        return await Okey(() => _mediator.Send(query));
    }
}