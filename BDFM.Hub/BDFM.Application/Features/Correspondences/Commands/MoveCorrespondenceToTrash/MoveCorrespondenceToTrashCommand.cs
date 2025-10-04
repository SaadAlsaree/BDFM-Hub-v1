namespace BDFM.Application.Features.Correspondences.Commands.MoveCorrespondenceToTrash
{
    public class MoveCorrespondenceToTrashCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }
    }
}
