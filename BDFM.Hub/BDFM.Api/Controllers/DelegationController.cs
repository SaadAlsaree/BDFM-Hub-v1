using BDFM.Application.Features.Security.Delegations.Commands.CreateDelegation;
using BDFM.Application.Features.Security.Delegations.Commands.DeleteDelegation;
using BDFM.Application.Features.Security.Delegations.Commands.UpdateDelegation;
using BDFM.Application.Features.Security.Delegations.Queries;
using BDFM.Application.Features.Security.Delegations.Queries.GetDelegationById;
using BDFM.Application.Features.Security.Delegations.Queries.GetDelegationList;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Delegations")]
//[Permission]
public class DelegationController : Base<DelegationController>
{
    private readonly IMediator _mediator;

    public DelegationController(ILogger<DelegationController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new delegation
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateDelegation([FromBody] CreateDelegationCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing delegation
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateDelegation([FromBody] UpdateDelegationCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a delegation
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteDelegation([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteDelegationCommand { Id = id }));
    }

    /// <summary>
    /// Gets a delegation by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<DelegationViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<DelegationViewModel>>> GetDelegationById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetDelegationByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of delegations with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<DelegationListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<DelegationListViewModel>>>> GetDelegationList([FromQuery] GetDelegationListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}