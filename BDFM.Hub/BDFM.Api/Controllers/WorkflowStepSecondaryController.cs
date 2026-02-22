using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
using BDFM.Application.Features.WorkflowStepSecondary.Commands.CreateWorkflowStepSecondary;
using BDFM.Application.Features.WorkflowStepSecondary.Commands.UpdateWorkflowStepSecondary;
using BDFM.Application.Features.WorkflowStepSecondary.Queries.GetWorkflowStepSecondaryByStepId;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("WorkflowStepSecondary")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
 [Authorize]
//[Permission]
public class WorkflowStepSecondaryController : Base<WorkflowStepSecondaryController>
{
    private readonly IMediator _mediator;

    public WorkflowStepSecondaryController(ILogger<WorkflowStepSecondaryController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new workflow step secondary recipient
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateWorkflowStepSecondary([FromBody] CreateWorkflowStepSecondaryCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets secondary recipients for a specific workflow step with pagination and filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<WorkflowStepSecondaryRecipientVM>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<WorkflowStepSecondaryRecipientVM>>>> GetWorkflowStepSecondaryByStepId([FromQuery] GetWorkflowStepSecondaryByStepIdQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Updates a workflow step secondary recipient
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateWorkflowStepSecondary([FromBody] UpdateWorkflowStepSecondaryCommand command)
    {

        return await Okey(() => _mediator.Send(command));
    }

    /// Deletes a workflow step secondary recipient
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteWorkflowStepSecondary([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid>
        {
            Id = id,
            TableName = TableNames.WorkflowStepSecondaryRecipients
        }));
    }

    /// <summary>
    /// Changes the status of a workflow step secondary recipient
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.WorkflowStepSecondaryRecipients;
        return await Okey(() => _mediator.Send(command));
    }
}