using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.CorrespondencesSummary;

public class CorrespondencesSummaryHandler : IRequestHandler<CorrespondencesSummaryQuery, Response<List<CorrespondencesSummaryVm>>>
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

    public async Task<Response<List<CorrespondencesSummaryVm>>> Handle(
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
                               (u.UnitType == UnitType.DEPARTMENT || u.UnitType == UnitType.DIRECTORATE || u.UnitType == UnitType.OFFICE))
                    .FirstOrDefaultAsync(cancellationToken);
                
                if (specifiedUnit == null)
                {
                    _logger.LogInformation("Unit {UnitId} not found or does not match type criteria", request.UnitId.Value);
                    return Response<List<CorrespondencesSummaryVm>>.Success(new List<CorrespondencesSummaryVm>());
                }
                
                targetUnits = new List<OrganizationalUnit> { specifiedUnit };
            }
            else
            {
                // Get all units of type DEPARTMENT (1), DIRECTORATE (2), or OFFICE (5)
                targetUnits = await _unitRepository.Query()
                    .Where(u => !u.IsDeleted &&
                               (u.UnitType == UnitType.DEPARTMENT || u.UnitType == UnitType.DIRECTORATE || u.UnitType == UnitType.OFFICE))
                    .ToListAsync(cancellationToken);
            }

            if (!targetUnits.Any())
            {
                _logger.LogInformation("No units found with UnitType DEPARTMENT, DIRECTORATE, or OFFICE");
                return Response<List<CorrespondencesSummaryVm>>.Success(new List<CorrespondencesSummaryVm>());
            }

            // Step 2: Build list of all units (parent + sub-units) and create unit hierarchy map
            var allUnitsMap = new Dictionary<Guid, OrganizationalUnit>();
            var unitLevels = new Dictionary<Guid, int>(); // UnitId -> Level (higher number = deeper in hierarchy)
            var allTargetUnitIds = new HashSet<Guid>();

            // Load all units to build hierarchy
            var allUnits = await _unitRepository.Query()
                .Where(u => !u.IsDeleted)
                .ToListAsync(cancellationToken);

            // Build unit map
            foreach (var unit in allUnits)
            {
                allUnitsMap[unit.Id] = unit;
            }

            // Calculate unit levels (depth in hierarchy)
            foreach (var unit in allUnits)
            {
                unitLevels[unit.Id] = CalculateUnitLevel(unit.Id, allUnitsMap);
            }

            // For each target unit, get all sub-units recursively
            foreach (var targetUnit in targetUnits)
            {
                allTargetUnitIds.Add(targetUnit.Id);
                
                // Include sub-units only if IncludeSubUnits is true or if UnitId is not specified (default behavior)
                if (request.IncludeSubUnits || !request.UnitId.HasValue)
                {
                    var subUnitIds = await GetAllSubUnitIdsAsync(targetUnit.Id, cancellationToken);
                    foreach (var subUnitId in subUnitIds)
                    {
                        allTargetUnitIds.Add(subUnitId);
                    }
                }
            }

            // Step 3: Get all correspondences associated with these units
            IQueryable<Correspondence> correspondenceQuery = _correspondenceRepository.Query()
                .Where(c => !c.IsDeleted)
                .Include(c => c.CreateByUser)
                .Include(c => c.WorkflowSteps);

            // Apply filters from request
            // Note: UnitId filtering is handled by limiting targetUnits and allTargetUnitIds above
            if (request.StartDate.HasValue)
            {
                correspondenceQuery = correspondenceQuery.Where(c => c.MailDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                correspondenceQuery = correspondenceQuery.Where(c => c.MailDate <= request.EndDate.Value);
            }

            if (request.CorrespondenceType.HasValue)
            {
                correspondenceQuery = correspondenceQuery.Where(c => c.CorrespondenceType == request.CorrespondenceType.Value);
            }

            // Filter correspondences created by users in target units
            // Only get correspondences where CreateByUser.OrganizationalUnitId is in target units
            var allCorrespondences = await correspondenceQuery
                .Where(c =>
                    // Created by user in one of the target units
                    c.CreateByUser != null &&
                    c.CreateByUser.OrganizationalUnitId.HasValue &&
                    allTargetUnitIds.Contains(c.CreateByUser.OrganizationalUnitId.Value))
                .ToListAsync(cancellationToken);
            
            // Also get forwarded correspondences for TotalCorrespondencesForwarded calculation
            var forwardedCorrespondences = await correspondenceQuery
                .Where(c =>
                    // Forwarded to one of the target units via WorkflowStep
                    c.WorkflowSteps.Any(ws =>
                        ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                        allTargetUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                    // Forwarded from one of the target units via WorkflowStep
                    c.WorkflowSteps.Any(ws =>
                        ws.FromUnitId.HasValue &&
                        allTargetUnitIds.Contains(ws.FromUnitId.Value)))
                .ToListAsync(cancellationToken);

            // Step 4: Deduplication - assign each correspondence to the deepest unit in hierarchy
            var correspondenceToUnitMap = new Dictionary<Guid, Guid>(); // CorrespondenceId -> UnitId

            foreach (var correspondence in allCorrespondences)
            {
                var deepestUnitId = GetDeepestUnitForCorrespondence(
                    correspondence,
                    allTargetUnitIds,
                    unitLevels,
                    allUnitsMap);

                if (deepestUnitId.HasValue)
                {
                    correspondenceToUnitMap[correspondence.Id] = deepestUnitId.Value;
                }
            }

            // Step 5: Calculate statistics for each unit
            var result = new List<CorrespondencesSummaryVm>();

            // Process only the target units (type 1-2), not all sub-units
            foreach (var targetUnit in targetUnits)
            {
                // Get all correspondences assigned to this unit or its sub-units
                var unitAndSubUnitIds = new HashSet<Guid> { targetUnit.Id };
                var subUnitIds = await GetAllSubUnitIdsAsync(targetUnit.Id, cancellationToken);
                foreach (var subUnitId in subUnitIds)
                {
                    unitAndSubUnitIds.Add(subUnitId);
                }

                // Get correspondences created by users in this unit and its sub-units
                var unitCorrespondences = correspondenceToUnitMap
                    .Where(kvp => unitAndSubUnitIds.Contains(kvp.Value))
                    .Select(kvp => allCorrespondences.FirstOrDefault(c => c.Id == kvp.Key))
                    .Where(c => c != null!)
                    .ToList()!;

                // Calculate forwarded correspondences for this unit and its sub-units
                var forwardedCorrespondencesForUnit = forwardedCorrespondences
                    .Where(c =>
                        c.WorkflowSteps.Any(ws =>
                            ws.ToPrimaryRecipientType == RecipientTypeEnum.Unit &&
                            unitAndSubUnitIds.Contains(ws.ToPrimaryRecipientId)) ||
                        c.WorkflowSteps.Any(ws =>
                            ws.FromUnitId.HasValue &&
                            unitAndSubUnitIds.Contains(ws.FromUnitId.Value)))
                    .ToList();

                // Calculate statistics
                // All statistics (except Forwarded) are calculated from correspondences created by users in the unit
                var summary = new CorrespondencesSummaryVm
                {
                    UnitId = targetUnit.Id,
                    UnitName = targetUnit.UnitName,
                    UnitCode = targetUnit.UnitCode,
                    UnitType = targetUnit.UnitType,
                    UnitTypeName = targetUnit.UnitType.GetDisplayName(),
                    TotalCorrespondences = unitCorrespondences.Count,
                    TotalCorrespondencesPending = unitCorrespondences.Count(c => c!.Status == CorrespondenceStatusEnum.PendingReferral),
                    TotalCorrespondencesUnderProcessing = unitCorrespondences.Count(c => c!.Status == CorrespondenceStatusEnum.UnderProcessing),
                    TotalCorrespondencesCompleted = unitCorrespondences.Count(c => c!.Status == CorrespondenceStatusEnum.Completed),
                    TotalCorrespondencesRejected = unitCorrespondences.Count(c => c!.Status == CorrespondenceStatusEnum.Rejected),
                    TotalCorrespondencesReturnedForModification = unitCorrespondences.Count(c => c!.Status == CorrespondenceStatusEnum.ReturnedForModification),
                    TotalCorrespondencesPostponed = unitCorrespondences.Count(c => c!.Status == CorrespondenceStatusEnum.Postponed),
                    // Forwarded correspondences are calculated from WorkflowSteps (as before)
                    TotalCorrespondencesForwarded = forwardedCorrespondencesForUnit.Count
                };

                result.Add(summary);
            }

            return Response<List<CorrespondencesSummaryVm>>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving correspondences summary for units type 1-2");
            return Response<List<CorrespondencesSummaryVm>>.Fail(
                new List<object> { ex.Message },
                new MessageResponse { Code = "Error3000", Message = "خطأ في تحميل ملخص المراسلات" });
        }
    }

    /// <summary>
    /// Recursively gets all sub-unit IDs for a given parent unit
    /// </summary>
    private async Task<HashSet<Guid>> GetAllSubUnitIdsAsync(
        Guid parentUnitId,
        CancellationToken cancellationToken)
    {
        var allSubUnitIds = new HashSet<Guid>();

        // Get direct child units
        var childUnits = await _unitRepository.Query()
            .Where(u => u.ParentUnitId == parentUnitId && !u.IsDeleted)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        foreach (var childUnitId in childUnits)
        {
            allSubUnitIds.Add(childUnitId);

            // Recursively get sub-units of this child unit
            var subSubUnitIds = await GetAllSubUnitIdsAsync(childUnitId, cancellationToken);
            foreach (var subSubUnitId in subSubUnitIds)
            {
                allSubUnitIds.Add(subSubUnitId);
            }
        }

        return allSubUnitIds;
    }

    /// <summary>
    /// Calculates the level (depth) of a unit in the hierarchy
    /// </summary>
    private int CalculateUnitLevel(Guid unitId, Dictionary<Guid, OrganizationalUnit> allUnitsMap)
    {
        if (!allUnitsMap.TryGetValue(unitId, out var unit) || unit.ParentUnitId == null)
        {
            return 0; // Root level
        }

        return 1 + CalculateUnitLevel(unit.ParentUnitId.Value, allUnitsMap);
    }

    /// <summary>
    /// Determines the deepest unit in hierarchy for a correspondence
    /// This ensures deduplication - if a correspondence is associated with both parent and child units,
    /// it will be counted only in the child unit (deeper in hierarchy)
    /// Now only considers CreateByUser.OrganizationalUnitId
    /// </summary>
    private Guid? GetDeepestUnitForCorrespondence(
        Correspondence correspondence,
        HashSet<Guid> targetUnitIds,
        Dictionary<Guid, int> unitLevels,
        Dictionary<Guid, OrganizationalUnit> allUnitsMap)
    {
        // Only consider the unit of the user who created the correspondence
        if (correspondence.CreateByUser?.OrganizationalUnitId.HasValue == true &&
            targetUnitIds.Contains(correspondence.CreateByUser.OrganizationalUnitId.Value))
        {
            return correspondence.CreateByUser.OrganizationalUnitId.Value;
        }

        return null;
    }
}
