namespace BDFM.Application.Features.Correspondences.Queries.CorrespondencesSummary;



public class CorrespondencesSummaryAllVm
{
    public int TotalAllCorrespondences { get; set; }
    public int TotalAllCorrespondencesPending { get; set; }
    public int TotalAllCorrespondencesUnderProcessing { get; set; }
    public int TotalAllCorrespondencesCompleted { get; set; }
    public int TotalAllCorrespondencesRejected { get; set; }
    public int TotalAllCorrespondencesReturnedForModification { get; set; }
    public int TotalAllCorrespondencesPostponed { get; set; }
    public int TotalAllCorrespondencesForwarded { get; set; }

    public List<CorrespondencesSummaryVm> Units { get; set; } = new();
}

public class CorrespondencesSummaryVm
{
    public Guid UnitId { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public UnitType UnitType { get; set; }
    public string UnitTypeName { get; set; } = string.Empty;

    public int TotalCorrespondences { get; set; }
    public int TotalCorrespondencesPending { get; set; }
    public int TotalCorrespondencesUnderProcessing { get; set; }
    public int TotalCorrespondencesCompleted { get; set; }
    public int TotalCorrespondencesRejected { get; set; }
    public int TotalCorrespondencesReturnedForModification { get; set; }
    public int TotalCorrespondencesPostponed { get; set; }

    public int TotalCorrespondencesForwarded { get; set; }
}
