using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.Correspondences.Queries.CorrespondencesSummary;

public class CorrespondencesSummaryHandler : IRequestHandler<CorrespondencesSummaryQuery, Response<CorrespondencesSummaryAllVm>>
{
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly ILogger<CorrespondencesSummaryHandler> _logger;

    public CorrespondencesSummaryHandler(
        IBaseRepository<OrganizationalUnit> unitRepository,
        IBaseRepository<Correspondence> correspondenceRepository,
        ILogger<CorrespondencesSummaryHandler> logger)
    {
        _unitRepository = unitRepository ?? throw new ArgumentNullException(nameof(unitRepository));
        _correspondenceRepository = correspondenceRepository ?? throw new ArgumentNullException(nameof(correspondenceRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Response<CorrespondencesSummaryAllVm>> Handle(
        CorrespondencesSummaryQuery request,
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
                    return Response<CorrespondencesSummaryAllVm>.Success(new CorrespondencesSummaryAllVm
                    {
                        Units = new List<CorrespondencesSummaryVm>()
                    });
                }

                targetUnits = new List<OrganizationalUnit> { specifiedUnit };
            }
            else
            {
                // Get all units of type DEPARTMENT (1), DIRECTORATE (2), or OFFICE (5)
                targetUnits = await _unitRepository.Query()
                    .Where(u => !u.IsDeleted &&
                               (u.UnitType == UnitType.DEPARTMENT || u.UnitType == UnitType.DIRECTORATE))
                    .ToListAsync(cancellationToken);
            }

            if (!targetUnits.Any())
            {
                _logger.LogInformation("No units found with UnitType DEPARTMENT, DIRECTORATE, or OFFICE");
                return Response<CorrespondencesSummaryAllVm>.Success(new CorrespondencesSummaryAllVm
                {
                    Units = new List<CorrespondencesSummaryVm>()
                });
            }

            // Step 2: Build list of all units (parent + sub-units) and create unit hierarchy map
            // Optimize: Load only required fields and build hierarchy map efficiently
            var allUnitsMap = new Dictionary<Guid, (Guid? ParentUnitId, int Level)>();
            var allTargetUnitIds = new HashSet<Guid>();
            var subUnitCache = new Dictionary<Guid, HashSet<Guid>>(); // Cache for sub-unit IDs

            // Load only required fields for hierarchy (Id, ParentUnitId)
            var allUnitsHierarchy = await _unitRepository.Query()
                .Where(u => !u.IsDeleted)
                .Select(u => new UnitHierarchyItem { Id = u.Id, ParentUnitId = u.ParentUnitId })
                .ToListAsync(cancellationToken);

            // Build unit map with parent relationships
            foreach (var unit in allUnitsHierarchy)
            {
                allUnitsMap[unit.Id] = (unit.ParentUnitId, 0); // Level will be calculated later
            }

            // Calculate unit levels (depth in hierarchy) - optimized
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

            // Step 3: Get correspondences data using optimized queries with projection
            // Build base query with filters
            var baseCorrespondenceQuery = _correspondenceRepository.Query()
                .Where(c => !c.IsDeleted);

            if (request.StartDate.HasValue)
            {
                baseCorrespondenceQuery = baseCorrespondenceQuery.Where(c => c.MailDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                baseCorrespondenceQuery = baseCorrespondenceQuery.Where(c => c.MailDate <= request.EndDate.Value);
            }

            if (request.CorrespondenceType.HasValue)
            {
                baseCorrespondenceQuery = baseCorrespondenceQuery.Where(c => c.CorrespondenceType == request.CorrespondenceType.Value);
            }

            // Optimize: Use projection to get only required fields instead of full entities
            var correspondenceData = await baseCorrespondenceQuery
                .Where(c =>
                    c.CreateByUser != null &&
                    c.CreateByUser.OrganizationalUnitId.HasValue &&
                    allTargetUnitIds.Contains(c.CreateByUser.OrganizationalUnitId.Value))
                .Select(c => new
                {
                    c.Id,
                    c.Status,
                    CreateByUserUnitId = c.CreateByUser!.OrganizationalUnitId!.Value
                })
                .ToListAsync(cancellationToken);

            // Get forwarded correspondences count per unit (optimized)
            var forwardedCorrespondenceData = await baseCorrespondenceQuery
                .Where(c =>
                    c.WorkflowSteps.Any(ws =>
                        ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                        allTargetUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                    c.WorkflowSteps.Any(ws =>
                        ws.FromUnitId.HasValue &&
                        allTargetUnitIds.Contains(ws.FromUnitId.Value)))
                .Select(c => new
                {
                    CorrespondenceId = c.Id,
                    ToUnitIds = c.WorkflowSteps
                        .Where(ws => ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit && allTargetUnitIds.Contains(ws.ToPrimaryRecipientId))
                        .Select(ws => ws.ToPrimaryRecipientId)

                        .ToList(),
                    FromUnitIds = c.WorkflowSteps
                        .Where(ws => ws.FromUnitId.HasValue && allTargetUnitIds.Contains(ws.FromUnitId.Value))
                        .Select(ws => ws.FromUnitId!.Value)
                        .ToList()
                })
                .ToListAsync(cancellationToken);

            // Step 4: Deduplication - assign each correspondence to the deepest unit in hierarchy
            var correspondenceToUnitMap = new Dictionary<Guid, Guid>(); // CorrespondenceId -> UnitId

            foreach (var corr in correspondenceData)
            {
                var deepestUnitId = GetDeepestUnitForCorrespondenceOptimized(
                    corr.CreateByUserUnitId,
                    allTargetUnitIds,
                    allUnitsMap);

                if (deepestUnitId.HasValue)
                {
                    correspondenceToUnitMap[corr.Id] = deepestUnitId.Value;
                }
            }

            // Step 5: Calculate statistics for each unit (optimized)
            var result = new List<CorrespondencesSummaryVm>();

            // Process only the target units (type 1-2), not all sub-units
            foreach (var targetUnit in targetUnits)
            {
                // Get all correspondences assigned to this unit or its sub-units (use cache)
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

                // Get correspondences created by users in this unit and its sub-units (optimized)
                var unitCorrespondenceIds = correspondenceToUnitMap
                    .Where(kvp => unitAndSubUnitIds.Contains(kvp.Value))
                    .Select(kvp => kvp.Key)
                    .ToHashSet();

                var unitCorrespondences = correspondenceData
                    .Where(c => unitCorrespondenceIds.Contains(c.Id))
                    .ToList();

                // Calculate forwarded correspondences for this unit and its sub-units (optimized)
                var forwardedCount = forwardedCorrespondenceData
                    .Count(c =>
                        c.ToUnitIds.Any(uid => unitAndSubUnitIds.Contains(uid)) ||
                        c.FromUnitIds.Any(uid => unitAndSubUnitIds.Contains(uid)));

                // Calculate statistics (optimized - single pass)
                var pending = 0;
                var underProcessing = 0;
                var completed = 0;
                var rejected = 0;
                var returnedForModification = 0;
                var postponed = 0;

                // Single pass through correspondences to count all statuses
                foreach (var corr in unitCorrespondences)
                {
                    switch (corr.Status)
                    {
                        case CorrespondenceStatusEnum.PendingReferral:
                            pending++;
                            break;
                        case CorrespondenceStatusEnum.UnderProcessing:
                            underProcessing++;
                            break;
                        case CorrespondenceStatusEnum.Completed:
                            completed++;
                            break;
                        case CorrespondenceStatusEnum.Rejected:
                            rejected++;
                            break;
                        case CorrespondenceStatusEnum.ReturnedForModification:
                            returnedForModification++;
                            break;
                        case CorrespondenceStatusEnum.Postponed:
                            postponed++;
                            break;
                    }
                }

                var summary = new CorrespondencesSummaryVm
                {
                    UnitId = targetUnit.Id,
                    UnitName = targetUnit.UnitName,
                    UnitCode = targetUnit.UnitCode,
                    UnitType = targetUnit.UnitType,
                    UnitTypeName = targetUnit.UnitType.GetDisplayName(),
                    TotalCorrespondences = unitCorrespondences.Count,
                    TotalCorrespondencesPending = pending,
                    TotalCorrespondencesUnderProcessing = underProcessing,
                    TotalCorrespondencesCompleted = completed,
                    TotalCorrespondencesRejected = rejected,
                    TotalCorrespondencesReturnedForModification = returnedForModification,
                    TotalCorrespondencesPostponed = postponed,
                    TotalCorrespondencesForwarded = forwardedCount
                };

                result.Add(summary);
            }

            // Calculate total aggregates directly from source data to avoid double counting
            // This ensures each correspondence is counted only once
            var totalAllCorrespondences = correspondenceData.Count;
            var totalAllPending = correspondenceData.Count(c => c.Status == CorrespondenceStatusEnum.PendingReferral);
            var totalAllUnderProcessing = correspondenceData.Count(c => c.Status == CorrespondenceStatusEnum.UnderProcessing);
            var totalAllCompleted = correspondenceData.Count(c => c.Status == CorrespondenceStatusEnum.Completed);
            var totalAllRejected = correspondenceData.Count(c => c.Status == CorrespondenceStatusEnum.Rejected);
            var totalAllReturnedForModification = correspondenceData.Count(c => c.Status == CorrespondenceStatusEnum.ReturnedForModification);
            var totalAllPostponed = correspondenceData.Count(c => c.Status == CorrespondenceStatusEnum.Postponed);

            // For forwarded correspondences, count unique correspondence IDs
            var totalAllForwarded = forwardedCorrespondenceData.Select(c => c.CorrespondenceId).Distinct().Count();

            var summaryAll = new CorrespondencesSummaryAllVm
            {
                TotalAllCorrespondences = totalAllCorrespondences,
                TotalAllCorrespondencesPending = totalAllPending,
                TotalAllCorrespondencesUnderProcessing = totalAllUnderProcessing,
                TotalAllCorrespondencesCompleted = totalAllCompleted,
                TotalAllCorrespondencesRejected = totalAllRejected,
                TotalAllCorrespondencesReturnedForModification = totalAllReturnedForModification,
                TotalAllCorrespondencesPostponed = totalAllPostponed,
                TotalAllCorrespondencesForwarded = totalAllForwarded,
                Units = result
            };

            return Response<CorrespondencesSummaryAllVm>.Success(summaryAll);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving correspondences summary for units type 1-2");
            return Response<CorrespondencesSummaryAllVm>.Fail(
                new List<object> { ex.Message },
                new MessageResponse { Code = "Error3000", Message = "خطأ في تحميل ملخص المراسلات" });
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
    /// Optimized: Determines the deepest unit in hierarchy for a correspondence
    /// This ensures deduplication - if a correspondence is associated with both parent and child units,
    /// it will be counted only in the child unit (deeper in hierarchy)
    /// </summary>
    private Guid? GetDeepestUnitForCorrespondenceOptimized(
        Guid createByUserUnitId,
        HashSet<Guid> targetUnitIds,
        Dictionary<Guid, (Guid? ParentUnitId, int Level)> allUnitsMap)
    {
        // Only consider the unit of the user who created the correspondence
        if (targetUnitIds.Contains(createByUserUnitId))
        {
            return createByUserUnitId;
        }

        return null;
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
