
using BDFM.Application.Features.CustomWorkflows.Commands.CreateCustomWorkflow;
using BDFM.Application.Features.CustomWorkflows.Commands.SoftDeleteCustomWorkflow;
using BDFM.Application.Features.CustomWorkflows.Commands.UpdateCustomWorkflow;
using BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowById;
using BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowList;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("CustomWorkflows")]
//[Permission]
public class CustomWorkflowsController : Base<CustomWorkflowsController>
{
    private readonly IMediator _mediator;

    public CustomWorkflowsController(ILogger<CustomWorkflowsController> logger, IMediator mediator) : base(logger)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<GetCustomWorkflowListVm>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<GetCustomWorkflowListVm>>>> GetCustomWorkflowList([FromQuery] GetCustomWorkflowListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<GetCustomWorkflowByIdVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<GetCustomWorkflowByIdVm>>> GetCustomWorkflowById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetCustomWorkflowByIdQuery { Id = id }));
    }


    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<Guid>>> CreateCustomWorkflow([FromBody] CreateCustomWorkflowCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }


    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateCustomWorkflow([FromBody] UpdateCustomWorkflowCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }


    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteCustomWorkflow([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new SoftDeleteCustomWorkflowCommand { Id = id }));
    }


}
