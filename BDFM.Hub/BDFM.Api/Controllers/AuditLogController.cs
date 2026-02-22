using BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogById;
using BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogList;
using BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditStatistics;
using BDFM.Application.Features.Security.AuditLogs.Queries.GetCorrespondenceAuditTrail;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("AuditLogs")]
[EnableRateLimiting("per-user")]
[Authorize(Roles = "Admin")]
//[Permission]
public class AuditLogController : Base<AuditLogController>
{
    private readonly IMediator _mediator;

    public AuditLogController(ILogger<AuditLogController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets an audit log by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<AuditLogViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<AuditLogViewModel>>> GetAuditLogById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetAuditLogByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of audit logs with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<AuditLogListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<AuditLogListViewModel>>>> GetAuditLogList([FromQuery] GetAuditLogListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// جلب سجل الإجراءات الداخلية لمراسلة معينة
    /// </summary>
    [HttpGet("correspondence/{correspondenceId}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<CorrespondenceAuditTrailViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<CorrespondenceAuditTrailViewModel>>>> GetCorrespondenceAuditTrail(
        [FromRoute] Guid correspondenceId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] List<string>? actionTypes = null,
        [FromQuery] bool includeUserDetails = true)
    {
        var query = new GetCorrespondenceAuditTrailQuery
        {
            CorrespondenceId = correspondenceId,
            FromDate = fromDate,
            ToDate = toDate,
            ActionTypes = actionTypes,
            IncludeUserDetails = includeUserDetails
        };

        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// جلب إحصائيات سجل الإجراءات لمراسلة معينة
    /// </summary>
    [HttpGet("correspondence/{correspondenceId}/statistics")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<CorrespondenceAuditStatisticsViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<CorrespondenceAuditStatisticsViewModel>>> GetCorrespondenceAuditStatistics(
        [FromRoute] Guid correspondenceId)
    {
        var query = new GetCorrespondenceAuditStatisticsQuery
        {
            CorrespondenceId = correspondenceId
        };

        return await Okey(() => _mediator.Send(query));
    }
}