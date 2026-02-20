using BDFM.Application.Features.Administration.Templates;
using BDFM.Application.Features.Administration.Templates.Commands.CreateCorrespondenceTemplate;
using BDFM.Application.Features.Administration.Templates.Commands.UpdateCorrespondenceTemplate;
using BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateById;
using BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateList;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
using Microsoft.AspNetCore.RateLimiting;


namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("CorrespondenceTemplates")]
[EnableRateLimiting("per-user")]
[Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
//[Permission]
public class CorrespondenceTemplateController : Base<CorrespondenceTemplateController>
{
    private readonly IMediator _mediator;

    public CorrespondenceTemplateController(ILogger<CorrespondenceTemplateController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new correspondence template
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateCorrespondenceTemplate([FromBody] CreateCorrespondenceTemplateCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing correspondence template
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateCorrespondenceTemplate([FromBody] UpdateCorrespondenceTemplateCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes the status of a correspondence template
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.CorrespondenceTemplates;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a correspondence template
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteCorrespondenceTemplate([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid> { Id = id, TableName = TableNames.CorrespondenceTemplates }));
    }

    /// <summary>
    /// Gets a correspondence template by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<CorrespondenceTemplateViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<CorrespondenceTemplateViewModel>>> GetCorrespondenceTemplateById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetCorrespondenceTemplateByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of correspondence templates with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<CorrespondenceTemplateListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<CorrespondenceTemplateListViewModel>>>> GetCorrespondenceTemplateList([FromQuery] GetCorrespondenceTemplateListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

}