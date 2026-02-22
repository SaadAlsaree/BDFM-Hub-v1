using BDFM.Application.Features.Administration.ExternalEntities;
using BDFM.Application.Features.Administration.ExternalEntities.Commands.CreateExternalEntity;
using BDFM.Application.Features.Administration.ExternalEntities.Commands.UpdateExternalEntity;
using BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityById;
using BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityList;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("ExternalEntities")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
 [Authorize]
//[Permission]
public class ExternalEntityController : Base<ExternalEntityController>
{
    private readonly IMediator _mediator;

    public ExternalEntityController(ILogger<ExternalEntityController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new external entity
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateExternalEntity([FromBody] CreateExternalEntityCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing external entity
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateExternalEntity([FromBody] UpdateExternalEntityCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes the status of an external entity
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.ExternalEntities;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes an external entity
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteExternalEntity([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid> { Id = id, TableName = TableNames.ExternalEntities }));
    }

    /// <summary>
    /// Gets an external entity by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<ExternalEntityViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<ExternalEntityViewModel>>> GetExternalEntityById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetExternalEntityByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of external entities with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<ExternalEntityListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<ExternalEntityListViewModel>>>> GetExternalEntityList([FromQuery] GetExternalEntityListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}