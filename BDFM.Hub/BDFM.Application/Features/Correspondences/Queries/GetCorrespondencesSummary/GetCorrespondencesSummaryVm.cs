namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondencesSummary;

public class GetCorrespondencesSummaryVm
{
    public int TotalCorrespondencesPending { get; set; }
    public int TotalCorrespondencesUnderProcessing { get; set; }
    public int TotalCorrespondencesCompleted { get; set; }
    public int TotalCorrespondencesRejected { get; set; }
    public int TotalCorrespondencesReturnedForModification { get; set; }
    public int TotalCorrespondencesPostponed { get; set; }
    public int TotalCorrespondences { get; set; }


    public int TotalIncomingExternal { get; set; }
    public int TotalOutgoingExternal { get; set; }
    public int TotalIncomingInternal { get; set; }
    public int TotalOutgoingInternal { get; set; }
    public int TotalMemorandum { get; set; }
    public int TotalReplies { get; set; }
    public int TotalPublics { get; set; }
    public int TotalDrafts { get; set; }



}
