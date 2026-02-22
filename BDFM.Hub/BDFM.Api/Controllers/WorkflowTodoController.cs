using BDFM.Application.Features.WorkflowTodo.Commands.CreateWorkflowTodo;
using BDFM.Application.Features.WorkflowTodo.Commands.DeleteWorkflowTodo;
using BDFM.Application.Features.WorkflowTodo.Commands.UpdateStatusWorkflowTodo;
using BDFM.Application.Features.WorkflowTodo.Commands.UpdateWorkflowTodo;
using BDFM.Application.Features.WorkflowTodo.Queries.GetWorkflowTodoByWorkflowId;
using Microsoft.AspNetCore.RateLimiting;


namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("WorkflowTodo")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
 [Authorize]
public class WorkflowTodoController : Base<WorkflowTodoController>
{
    private readonly IMediator _mediator;

    public WorkflowTodoController(ILogger<WorkflowTodoController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new workflow todo item
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateWorkflowTodo([FromBody] CreateWorkflowTodoCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing workflow todo item
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateWorkflowTodo([FromBody] UpdateWorkflowTodoCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates the completion status of a workflow todo item
    /// </summary>
    [HttpPatch("UpdateStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateWorkflowTodoStatus([FromBody] UpdateStatusWorkflowTodoCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a workflow todo item
    /// </summary>
    [HttpDelete("{workflowStepTodoId}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteWorkflowTodo([FromRoute] Guid workflowStepTodoId)
    {
        return await Okey(() => _mediator.Send(new DeleteWorkflowTodoCommand { WorkflowStepTodoId = workflowStepTodoId }));
    }

    /// <summary>
    /// Gets a paginated list of workflow todo items by workflow ID with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<GetWorkflowTodoByWorkflowIdVm>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<GetWorkflowTodoByWorkflowIdVm>>>> GetWorkflowTodoByWorkflowId([FromQuery] GetWorkflowTodoByWorkflowIdQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}