namespace BDFM.Application.Features.Correspondences.Commands.RestoreCorrespondenceFromTrash
{
    public class RestoreCorrespondenceFromTrashCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }
    }
}
