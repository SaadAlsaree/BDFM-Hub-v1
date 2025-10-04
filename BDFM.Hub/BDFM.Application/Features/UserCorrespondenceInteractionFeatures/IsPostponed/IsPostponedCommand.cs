namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsPostponed
{
    public class IsPostponedCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public DateTime? PostponeDate { get; set; }
    }
}
