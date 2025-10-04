namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsStarred
{
    public class IsStarredCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public bool IsStarred { get; set; }
    }
}
