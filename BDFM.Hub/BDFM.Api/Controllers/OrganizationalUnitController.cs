using BDFM.Application.Features.Administration.Templates;
using BDFM.Application.Features.OrganizationalUnits.Commands.CreateOrganizationalUnit;
using BDFM.Application.Features.OrganizationalUnits.Commands.DeleteOrganizationalUnit;
using BDFM.Application.Features.OrganizationalUnits.Commands.UpdateOrganizationalUnit;
using BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitById;
using BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitList;
using BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitListById;
using BDFM.Application.Features.OrganizationalUnits.Queries.GetOrganizationalUnitTree;
using BDFM.Application.Features.OrganizationalUnits.Queries.SearchOrganizationalUnit;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("OrganizationalUnits")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
 [Authorize]
//[Permission]
public class OrganizationalUnitController : Base<OrganizationalUnitController>
{
    private readonly IMediator _mediator;

    public OrganizationalUnitController(ILogger<OrganizationalUnitController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new organizational unit
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateOrganizationalUnit([FromBody] CreateOrganizationalUnitCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing organizational unit
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateOrganizationalUnit([FromBody] UpdateOrganizationalUnitCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes an organizational unit
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteOrganizationalUnit([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteOrganizationalUnitCommand { Id = id }));
    }

    /// <summary>
    /// Changes the status of an organizational unit
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.OrganizationalUnits;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets an organizational unit by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<OrganizationalUnitViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<OrganizationalUnitViewModel>>> GetOrganizationalUnitById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetOrganizationalUnitByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of organizational units with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<OrganizationalUnitListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<OrganizationalUnitListViewModel>>>> GetOrganizationalUnitList([FromQuery] GetOrganizationalUnitListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets all descendant organizational units (all levels) within a specific organizational unit
    /// </summary>
    [HttpGet()]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<GetOrganizationalUnitListByIdVM>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<GetOrganizationalUnitListByIdVM>>>> GetOrganizationalUnitListById([FromQuery] bool includeInactive = false)
    {
        return await Okey(() => _mediator.Send(new GetOrganizationalUnitListByIdQuery { IncludeInactive = includeInactive }));
    }

    /// <summary>
    /// /OrganizationalUnit/GetOrganizationalUnitTree/Tree
    /// </summary>
    [HttpGet("Tree")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<OrganizationalUnitTreeViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<OrganizationalUnitTreeViewModel>>>> GetOrganizationalUnitTree([FromQuery] Guid? rootUnitId = null)
    {
        return await Okey(() => _mediator.Send(new GetOrganizationalUnitTreeQuery { RootUnitId = rootUnitId }));
    }

    /// <summary>
    /// search Unit
    /// <summary>
    [ServiceFilter(typeof(LogActionArguments))]
    [HttpGet]
    [ProducesResponseType(typeof(Response<IEnumerable<CorrespondenceTemplateViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<IEnumerable<CorrespondenceTemplateViewModel>>>> Search([FromQuery] SearchOrganizationalUnitQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}
