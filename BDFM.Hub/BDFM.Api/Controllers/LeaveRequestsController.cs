using BDFM.Application.Features.LeaveCancellations.Queries.GetLeaveCancellationsByRequestId;
using BDFM.Application.Features.LeaveInterruptions.Queries.GetLeaveInterruptionsByRequestId;
using BDFM.Application.Features.LeaveRequests.Commands.ApproveLeaveRequest;
using BDFM.Application.Features.LeaveRequests.Commands.CancelLeaveRequest;
using BDFM.Application.Features.LeaveRequests.Commands.CreateLeaveRequest;
using BDFM.Application.Features.LeaveRequests.Commands.InterruptLeaveRequest;
using BDFM.Application.Features.LeaveRequests.Commands.RejectLeaveRequest;
using BDFM.Application.Features.LeaveRequests.Commands.UpdateLeaveRequest;
using BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;
using BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestById;
using BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestsByEmployeeId;
using BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestsByStatus;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("LeaveRequests")]
public class LeaveRequestsController : Base<LeaveRequestsController>
{
    private readonly IMediator _mediator;

    public LeaveRequestsController(IMediator mediator, ILogger<LeaveRequestsController> logger)
        : base(logger)
    {
        _mediator = mediator;
    }

    #region Command Endpoints

    /// <summary>
    /// Creates a new leave request
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<Guid>>> CreateLeaveRequest([FromBody] CreateLeaveRequestCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing leave request
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateLeaveRequest([FromBody] UpdateLeaveRequestCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Approves a leave request
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ApproveLeaveRequest([FromBody] ApproveLeaveRequestCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Rejects a leave request
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> RejectLeaveRequest([FromBody] RejectLeaveRequestCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Cancels an approved leave request
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CancelLeaveRequest([FromBody] CancelLeaveRequestCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Interrupts an approved leave request (employee returns early)
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> InterruptLeaveRequest([FromBody] InterruptLeaveRequestCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    #endregion

    #region Query Endpoints

    /// <summary>
    /// Gets a leave request by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<LeaveRequestViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<LeaveRequestViewModel>>> GetLeaveRequestById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetLeaveRequestByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of all leave requests with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<LeaveRequestListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<LeaveRequestListViewModel>>>> GetAllLeaveRequests([FromQuery] GetAllLeaveRequestsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets leave requests for a specific employee
    /// </summary>
    [HttpGet("ByEmployee/{employeeId}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<LeaveRequestListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<LeaveRequestListViewModel>>>> GetLeaveRequestsByEmployeeId(
        [FromRoute] string employeeId,
        [FromQuery] GetLeaveRequestsByEmployeeIdQuery query)
    {
        query.EmployeeId = employeeId;
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets leave requests by status
    /// </summary>
    [HttpGet("ByStatus/{status}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<LeaveRequestListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<LeaveRequestListViewModel>>>> GetLeaveRequestsByStatus(
        [FromRoute] LeaveRequestStatusEnum status,
        [FromQuery] GetLeaveRequestsByStatusQuery query)
    {
        query.Status = status;
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets all interruptions for a specific leave request
    /// </summary>
    [HttpGet("{requestId}/Interruptions")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<LeaveInterruptionViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<LeaveInterruptionViewModel>>>> GetLeaveInterruptionsByRequestId([FromRoute] Guid requestId)
    {
        return await Okey(() => _mediator.Send(new GetLeaveInterruptionsByRequestIdQuery { LeaveRequestId = requestId }));
    }

    /// <summary>
    /// Gets all cancellations for a specific leave request
    /// </summary>
    [HttpGet("{requestId}/Cancellations")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<LeaveCancellationViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<LeaveCancellationViewModel>>>> GetLeaveCancellationsByRequestId([FromRoute] Guid requestId)
    {
        return await Okey(() => _mediator.Send(new GetLeaveCancellationsByRequestIdQuery { LeaveRequestId = requestId }));
    }

    #endregion
}
