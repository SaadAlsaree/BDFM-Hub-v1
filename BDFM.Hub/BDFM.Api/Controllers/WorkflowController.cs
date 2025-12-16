using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
using BDFM.Application.Features.Workflow.Commands.CompleteWorkflowStep;
using BDFM.Application.Features.Workflow.Commands.CreateWorkflowStep;
using BDFM.Application.Features.Workflow.Commands.CreateBulkWorkflowSteps;
using BDFM.Application.Features.Workflow.Commands.LogRecipientInternalAction;
using BDFM.Application.Features.Workflow.Commands.UpdateWorkflowStepStatus;
using BDFM.Application.Features.Workflow.Queries.GetWorkflowStepsStatisticsByUnit;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Workflow")]
//[Permission]
public class WorkflowController : Base<WorkflowController>
{
    private readonly IMediator _mediator;

    public WorkflowController(ILogger<WorkflowController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new workflow step
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<Guid>>> CreateWorkflowStep([FromBody] CreateWorkflowStepCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Creates multiple workflow steps for a single correspondence
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateBulkWorkflowSteps([FromBody] CreateBulkWorkflowStepsCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Logs a recipient internal action for a workflow step
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> LogRecipientInternalAction([FromBody] LogRecipientInternalActionCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a workflow step
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteWorkflowStep([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid>
        {
            Id = id,
            TableName = TableNames.WorkflowSteps
        }));
    }

    /// <summary>
    /// Changes the status of a workflow step
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.WorkflowSteps;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Completes a workflow step
    /// </summary>
    [HttpPut("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CompleteWorkflowStep([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new CompleteWorkflowStepCommand { WorkflowStepId = id }));
    }


    /// <summary>
    /// Updates the status of a workflow step
    /// </summary>
    [HttpPatch("UpdateStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateStatus([FromBody] UpdateWorkflowStepStatusCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets workflow steps statistics for a specific unit or all units if UnitId is not specified
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<WorkflowStepsStatisticsAllVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Permission("Workflow|GetStatistics")]
    public async Task<ActionResult<Response<WorkflowStepsStatisticsAllVm>>> GetWorkflowStepsStatisticsByUnit([FromQuery] GetWorkflowStepsStatisticsByUnitQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}