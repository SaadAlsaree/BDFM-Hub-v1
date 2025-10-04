using BDFM.Application.Features.CustomWorkflowSteps.Commands.CreateCustomWorkflowStep;
using BDFM.Application.Features.CustomWorkflowSteps.Commands.SoftDeleteCustomWorkflowStep;
using BDFM.Application.Features.CustomWorkflowSteps.Commands.UpdateCustomWorkflowStep;
using BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepById;
using BDFM.Application.Features.CustomWorkflowSteps.Queries.GetCustomWorkflowStepList;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("CustomWorkflowSteps")]
//[Permission]
public class CustomWorkflowStepsController : Base<CustomWorkflowStepsController>
{
    private readonly IMediator _mediator;

    public CustomWorkflowStepsController(ILogger<CustomWorkflowStepsController> logger, IMediator mediator) : base(logger)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<GetCustomWorkflowStepListVm>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<GetCustomWorkflowStepListVm>>>> GetCustomWorkflowStepList([FromQuery] GetCustomWorkflowStepListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<GetCustomWorkflowStepByIdVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<GetCustomWorkflowStepByIdVm>>> GetCustomWorkflowStepById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetCustomWorkflowStepByIdQuery { Id = id }));
    }

    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<Guid>>> CreateCustomWorkflowStep([FromBody] CreateCustomWorkflowStepCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateCustomWorkflowStep([FromBody] UpdateCustomWorkflowStepCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteCustomWorkflowStep([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new SoftDeleteCustomWorkflowStepCommand { Id = id }));
    }
}