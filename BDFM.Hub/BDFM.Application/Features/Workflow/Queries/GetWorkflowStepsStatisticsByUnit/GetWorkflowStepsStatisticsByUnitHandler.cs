using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.Workflow.Queries.GetWorkflowStepsStatisticsByUnit;

public class GetWorkflowStepsStatisticsByUnitHandler : IRequestHandler<GetWorkflowStepsStatisticsByUnitQuery, Response<WorkflowStepsStatisticsAllVm>>
{
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly ILogger<GetWorkflowStepsStatisticsByUnitHandler> _logger;

    public GetWorkflowStepsStatisticsByUnitHandler(
        IBaseRepository<OrganizationalUnit> unitRepository,
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IBaseRepository<User> userRepository,
        ILogger<GetWorkflowStepsStatisticsByUnitHandler> logger)
    {
        _unitRepository = unitRepository ?? throw new ArgumentNullException(nameof(unitRepository));
        _workflowStepRepository = workflowStepRepository ?? throw new ArgumentNullException(nameof(workflowStepRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Response<WorkflowStepsStatisticsAllVm>> Handle(
        GetWorkflowStepsStatisticsByUnitQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Step 1: Get target units
            List<OrganizationalUnit> targetUnits;

            if (request.UnitId.HasValue)
            {
                // If UnitId is specified, get only that unit (if it matches the type criteria)
                var specifiedUnit = await _unitRepository.Query()
                    .Where(u => !u.IsDeleted &&
                               u.Id == request.UnitId.Value &&
                               (u.UnitType == UnitType.DEPARTMENT || u.UnitType == UnitType.DIRECTORATE))
                    .FirstOrDefaultAsync(cancellationToken);

                if (specifiedUnit == null)
                {
                    _logger.LogInformation("Unit {UnitId} not found or does not match type criteria", request.UnitId.Value);
                    return Response<WorkflowStepsStatisticsAllVm>.Success(new WorkflowStepsStatisticsAllVm
                    {
                        Units = new List<WorkflowStepsStatisticsVm>()
                    });
                }

                targetUnits = new List<OrganizationalUnit> { specifiedUnit };
            }
            else
            {
                // Get all units of type DEPARTMENT (1) or DIRECTORATE (2)
                targetUnits = await _unitRepository.Query()
                    .Where(u => !u.IsDeleted &&
                               (u.UnitType == UnitType.DEPARTMENT || u.UnitType == UnitType.DIRECTORATE))
                    .ToListAsync(cancellationToken);
            }

            if (!targetUnits.Any())
            {
                _logger.LogInformation("No units found with UnitType DEPARTMENT or DIRECTORATE");
                return Response<WorkflowStepsStatisticsAllVm>.Success(new WorkflowStepsStatisticsAllVm
                {
                    Units = new List<WorkflowStepsStatisticsVm>()
                });
            }

            // Step 2: Build list of all units (parent + sub-units) and create unit hierarchy map
            var allUnitsMap = new Dictionary<Guid, (Guid? ParentUnitId, int Level)>();
            var allTargetUnitIds = new HashSet<Guid>();
            var subUnitCache = new Dictionary<Guid, HashSet<Guid>>();

            // Load only required fields for hierarchy (Id, ParentUnitId)
            var allUnitsHierarchy = await _unitRepository.Query()
                .Where(u => !u.IsDeleted)
                .Select(u => new UnitHierarchyItem { Id = u.Id, ParentUnitId = u.ParentUnitId })
                .ToListAsync(cancellationToken);

            // Build unit map with parent relationships
            foreach (var unit in allUnitsHierarchy)
            {
                allUnitsMap[unit.Id] = (unit.ParentUnitId, 0);
            }

            // Calculate unit levels (depth in hierarchy)
            foreach (var unit in allUnitsHierarchy)
            {
                allUnitsMap[unit.Id] = (unit.ParentUnitId, CalculateUnitLevelOptimized(unit.Id, allUnitsMap));
            }

            // For each target unit, get all sub-units recursively (with caching)
            foreach (var targetUnit in targetUnits)
            {
                allTargetUnitIds.Add(targetUnit.Id);

                // Include sub-units only if IncludeSubUnits is true or if UnitId is not specified (default behavior)
                if (request.IncludeSubUnits || !request.UnitId.HasValue)
                {
                    var subUnitIds = await GetAllSubUnitIdsOptimizedAsync(targetUnit.Id, allUnitsHierarchy, subUnitCache, cancellationToken);
                    foreach (var subUnitId in subUnitIds)
                    {
                        allTargetUnitIds.Add(subUnitId);
                    }
                }
            }

            // Step 3: Get all user IDs in target units
            var userIdsInUnits = await GetAllUserIdsInUnitsAsync(allTargetUnitIds, cancellationToken);

            // Step 4: Build base query for WorkflowSteps
            var baseWorkflowStepQuery = _workflowStepRepository.Query()
                .Where(ws => ws.IsActive && 
                             ws.CorrespondenceId != null &&
                             !ws.IsDeleted);

            // Apply date filters if provided
            if (request.StartDate.HasValue)
            {
                var startDateTime = request.StartDate.Value.ToDateTime(TimeOnly.MinValue);
                baseWorkflowStepQuery = baseWorkflowStepQuery.Where(ws => ws.CreateAt >= startDateTime);
            }

            if (request.EndDate.HasValue)
            {
                var endDateTime = request.EndDate.Value.ToDateTime(TimeOnly.MaxValue);
                baseWorkflowStepQuery = baseWorkflowStepQuery.Where(ws => ws.CreateAt <= endDateTime);
            }

            // Step 5: Get workflow steps data for all target units and users
            var workflowStepsData = await baseWorkflowStepQuery
                .Where(ws =>
                    ((ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && 
                      allTargetUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                     (ws.ToPrimaryRecipientType == RecipientTypeEnum.User && 
                      userIdsInUnits.Contains(ws.ToPrimaryRecipientId))))
                .Select(ws => new
                {
                    ws.Id,
                    ws.Status,
                    ws.DueDate,
                    ToPrimaryRecipientId = ws.ToPrimaryRecipientId,
                    ToPrimaryRecipientType = ws.ToPrimaryRecipientType
                })
                .ToListAsync(cancellationToken);

            // Step 6: Calculate statistics for each unit
            var result = new List<WorkflowStepsStatisticsVm>();
            var now = DateTime.UtcNow;

            foreach (var targetUnit in targetUnits)
            {
                // Get all units for this target unit (including sub-units if applicable)
                var unitAndSubUnitIds = new HashSet<Guid> { targetUnit.Id };
                if (!subUnitCache.TryGetValue(targetUnit.Id, out var cachedSubUnitIds))
                {
                    cachedSubUnitIds = await GetAllSubUnitIdsOptimizedAsync(targetUnit.Id, allUnitsHierarchy, subUnitCache, cancellationToken);
                    subUnitCache[targetUnit.Id] = cachedSubUnitIds;
                }
                foreach (var subUnitId in cachedSubUnitIds)
                {
                    unitAndSubUnitIds.Add(subUnitId);
                }

                // Get user IDs for this unit and its sub-units
                var unitUserIds = await GetAllUserIdsInUnitsAsync(unitAndSubUnitIds, cancellationToken);

                // Filter workflow steps for this unit
                var unitWorkflowSteps = workflowStepsData
                    .Where(ws =>
                        (ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && 
                         unitAndSubUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                        (ws.ToPrimaryRecipientType == RecipientTypeEnum.User && 
                         unitUserIds.Contains(ws.ToPrimaryRecipientId)))
                    .ToList();

                // Calculate statistics
                var totalCount = unitWorkflowSteps.Count;
                var pendingCount = unitWorkflowSteps.Count(ws => ws.Status == WorkflowStepStatus.Pending);
                var inProgressCount = unitWorkflowSteps.Count(ws => ws.Status == WorkflowStepStatus.InProgress);
                var completedCount = unitWorkflowSteps.Count(ws => ws.Status == WorkflowStepStatus.Completed);
                var rejectedCount = unitWorkflowSteps.Count(ws => ws.Status == WorkflowStepStatus.Rejected);
                var delegatedCount = unitWorkflowSteps.Count(ws => ws.Status == WorkflowStepStatus.Delegated);
                var returnedCount = unitWorkflowSteps.Count(ws => ws.Status == WorkflowStepStatus.Returned);
                var delayedCount = unitWorkflowSteps.Count(ws =>
                    ws.DueDate.HasValue &&
                    ws.DueDate.Value < now &&
                    ws.Status != WorkflowStepStatus.Completed);

                var statistics = new WorkflowStepsStatisticsVm
                {
                    UnitId = targetUnit.Id,
                    UnitName = targetUnit.UnitName,
                    UnitCode = targetUnit.UnitCode,
                    UnitType = targetUnit.UnitType,
                    UnitTypeName = targetUnit.UnitType.GetDisplayName(),
                    TotalWorkflowSteps = totalCount,
                    PendingCount = pendingCount,
                    InProgressCount = inProgressCount,
                    CompletedCount = completedCount,
                    RejectedCount = rejectedCount,
                    DelegatedCount = delegatedCount,
                    ReturnedCount = returnedCount,
                    DelayedCount = delayedCount
                };

                result.Add(statistics);
            }

            var summaryAll = new WorkflowStepsStatisticsAllVm
            {
                Units = result
            };

            return Response<WorkflowStepsStatisticsAllVm>.Success(summaryAll);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow steps statistics for unit {UnitId}", request.UnitId);
            return Response<WorkflowStepsStatisticsAllVm>.Fail(
                new List<object> { ex.Message },
                new MessageResponse { Code = "Error3003", Message = "خطأ في تحميل إحصائيات خطوات سير العمل" });
        }
    }

    /// <summary>
    /// Optimized: Recursively gets all sub-unit IDs using in-memory data instead of database queries
    /// </summary>
    private Task<HashSet<Guid>> GetAllSubUnitIdsOptimizedAsync(
        Guid parentUnitId,
        List<UnitHierarchyItem> allUnitsHierarchy,
        Dictionary<Guid, HashSet<Guid>> cache,
        CancellationToken cancellationToken)
    {
        // Check cache first
        if (cache.TryGetValue(parentUnitId, out var cached))
        {
            return Task.FromResult(cached);
        }

        var allSubUnitIds = new HashSet<Guid>();

        // Get direct child units from in-memory data
        var childUnits = allUnitsHierarchy
            .Where(u => u.ParentUnitId == parentUnitId)
            .Select(u => u.Id)
            .ToList();

        foreach (var childUnitId in childUnits)
        {
            allSubUnitIds.Add(childUnitId);

            // Recursively get sub-units of this child unit (with caching)
            var subSubUnitIds = GetAllSubUnitIdsOptimizedAsync(childUnitId, allUnitsHierarchy, cache, cancellationToken).Result;
            foreach (var subSubUnitId in subSubUnitIds)
            {
                allSubUnitIds.Add(subSubUnitId);
            }
        }

        // Cache the result
        cache[parentUnitId] = allSubUnitIds;
        return Task.FromResult(allSubUnitIds);
    }

    /// <summary>
    /// Optimized: Calculates the level (depth) of a unit in the hierarchy using in-memory map
    /// </summary>
    private int CalculateUnitLevelOptimized(Guid unitId, Dictionary<Guid, (Guid? ParentUnitId, int Level)> allUnitsMap)
    {
        if (!allUnitsMap.TryGetValue(unitId, out var unitData) || unitData.ParentUnitId == null)
        {
            return 0; // Root level
        }

        // If level already calculated, return it
        if (unitData.Level > 0)
        {
            return unitData.Level;
        }

        // Calculate recursively
        var level = 1 + CalculateUnitLevelOptimized(unitData.ParentUnitId.Value, allUnitsMap);
        allUnitsMap[unitId] = (unitData.ParentUnitId, level);
        return level;
    }

    /// <summary>
    /// Gets all user IDs that belong to the specified units
    /// </summary>
    private async Task<HashSet<Guid>> GetAllUserIdsInUnitsAsync(
        HashSet<Guid> unitIds,
        CancellationToken cancellationToken)
    {
        if (!unitIds.Any())
        {
            return new HashSet<Guid>();
        }

        var userIds = await _userRepository.Query()
            .Where(u => !u.IsDeleted &&
                       u.OrganizationalUnitId.HasValue &&
                       unitIds.Contains(u.OrganizationalUnitId.Value))
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        return userIds.ToHashSet();
    }

    /// <summary>
    /// Helper class for unit hierarchy data
    /// </summary>
    private class UnitHierarchyItem
    {
        public Guid Id { get; set; }
        public Guid? ParentUnitId { get; set; }
    }
}
