namespace BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsInTrash
{
    public class IsInTrashCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public bool IsInTrash { get; set; }
    }
}
