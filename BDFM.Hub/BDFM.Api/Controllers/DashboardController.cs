using BDFM.Application.Features.Dashboard.Queries.GetBacklogDetails;
using BDFM.Application.Features.Dashboard.Queries.GetCorrespondenceMetrics;
using BDFM.Application.Features.Dashboard.Queries.GetDailyPerformanceSummary;
using BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Dashboard")]
[EnableRateLimiting("per-user")]
[Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
public class DashboardController : Base<DashboardController>
{
    private readonly IMediator _mediator;

    public DashboardController(ILogger<DashboardController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets comprehensive dashboard overview with all key metrics
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<DashboardOverviewViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<DashboardOverviewViewModel>>> GetOverview([FromQuery] GetDashboardOverviewQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets detailed correspondence metrics with filtering options
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<CorrespondenceMetricsViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<CorrespondenceMetricsViewModel>>> GetCorrespondenceMetrics([FromQuery] GetCorrespondenceMetricsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets detailed backlog information with task breakdown
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<BacklogDetailsViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<BacklogDetailsViewModel>>> GetBacklogDetails([FromQuery] GetBacklogDetailsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets unread correspondence count for a specific unit or all units
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<int>>> GetUnreadCount([FromQuery] Guid? unitId)
    {
        var query = new GetDashboardOverviewQuery { UnitId = unitId };
        var result = await _mediator.Send(query);

        if (result.Succeeded)
        {
            return await Okey(() => Task.FromResult(Response<int>.Success(result.Data!.UnreadIncomingMailCount)));
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Gets correspondence type distribution statistics
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<CorrespondenceTypeDistribution>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<CorrespondenceTypeDistribution>>>> GetTypeDistribution([FromQuery] Guid? unitId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = new GetDashboardOverviewQuery { UnitId = unitId, StartDate = startDate, EndDate = endDate };
        var result = await _mediator.Send(query);

        if (result.Succeeded)
        {
            return await Okey(() => Task.FromResult(Response<List<CorrespondenceTypeDistribution>>.Success(result.Data!.CorrespondenceTypeDistribution)));
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Gets correspondence status distribution statistics
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<CorrespondenceStatusDistribution>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<CorrespondenceStatusDistribution>>>> GetStatusDistribution([FromQuery] Guid? unitId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = new GetDashboardOverviewQuery { UnitId = unitId, StartDate = startDate, EndDate = endDate };
        var result = await _mediator.Send(query);

        if (result.Succeeded)
        {
            return await Okey(() => Task.FromResult(Response<List<CorrespondenceStatusDistribution>>.Success(result.Data!.CorrespondenceStatusDistribution)));
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Gets top units receiving the most correspondence
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<UnitCorrespondenceVolume>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<UnitCorrespondenceVolume>>>> GetTopUnits([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = new GetDashboardOverviewQuery { StartDate = startDate, EndDate = endDate };
        var result = await _mediator.Send(query);

        if (result.Succeeded)
        {
            return await Okey(() => Task.FromResult(Response<List<UnitCorrespondenceVolume>>.Success(result.Data!.TopUnitsReceivingCorrespondence)));
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Gets automation performance metrics
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<AutomationPerformanceMetrics>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<AutomationPerformanceMetrics>>> GetAutomationPerformance([FromQuery] Guid? unitId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = new GetDashboardOverviewQuery { UnitId = unitId, StartDate = startDate, EndDate = endDate };
        var result = await _mediator.Send(query);

        if (result.Succeeded)
        {
            return await Okey(() => Task.FromResult(Response<AutomationPerformanceMetrics>.Success(result.Data!.AutomationPerformance)));
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Gets quick stats summary for dashboard cards
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<QuickStatsViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<QuickStatsViewModel>>> GetQuickStats([FromQuery] Guid? unitId)
    {
        var query = new GetDashboardOverviewQuery { UnitId = unitId };
        var result = await _mediator.Send(query);

        if (result.Succeeded)
        {
            var quickStats = new QuickStatsViewModel
            {
                UnreadMail = result.Data!.UnreadIncomingMailCount,
                TotalActiveCorrespondence = result.Data.TotalActiveCorrespondence,
                TotalCorrespondence = result.Data.TotalCorrespondence,
                AverageMonthlyVolume = result.Data.AverageMonthlyVolume,
                TotalBackloggedTasks = result.Data.BacklogMetrics.TotalBackloggedTasks,
                OverdueTasks = result.Data.BacklogMetrics.OverdueTasks,
                AutomationSuccessRate = result.Data.AutomationPerformance.SuccessRate,
                FilteredByUnitName = result.Data.FilteredByUnitName
            };

            return await Okey(() => Task.FromResult(Response<QuickStatsViewModel>.Success(quickStats)));
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Get daily performance summary including today's processing, completion rate, and active units
    /// </summary>
    /// <param name="unitId">Optional unit ID to filter by specific unit</param>
    /// <param name="date">Optional date (defaults to today)</param>
    /// <returns>Daily performance summary</returns>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<DailyPerformanceSummaryViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<DailyPerformanceSummaryViewModel>>> GetDailyPerformanceSummary(
        [FromQuery] Guid? unitId = null,
        [FromQuery] DateTime? date = null)
    {
        var query = new GetDailyPerformanceSummaryQuery
        {
            UnitId = unitId,
            Date = date
        };
        return await Okey(() => _mediator.Send(query));
    }
}

public class QuickStatsViewModel
{
    public int UnreadMail { get; set; }
    public int TotalActiveCorrespondence { get; set; }
    public int TotalCorrespondence { get; set; }
    public double AverageMonthlyVolume { get; set; }
    public int TotalBackloggedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double AutomationSuccessRate { get; set; }
    public string? FilteredByUnitName { get; set; }
}