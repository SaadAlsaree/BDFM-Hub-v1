namespace BDFM.Application.Features.Correspondences.Queries.CorrespondencesSummary;

public class CorrespondencesSummaryQuery : IRequest<Response<CorrespondencesSummaryAllVm>>
{
    public Guid? UnitId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IncludeSubUnits { get; set; } = false;
    public CorrespondenceTypeEnum? CorrespondenceType { get; set; }
}
