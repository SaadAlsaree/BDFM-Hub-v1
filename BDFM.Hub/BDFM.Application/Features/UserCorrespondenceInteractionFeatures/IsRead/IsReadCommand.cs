namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsRead
{
    public class IsReadCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public bool IsRead { get; set; }
    }
}
