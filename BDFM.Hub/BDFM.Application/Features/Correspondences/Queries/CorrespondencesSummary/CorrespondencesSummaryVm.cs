namespace BDFM.Application.Features.Correspondences.Queries.CorrespondencesSummary;

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
