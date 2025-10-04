namespace BDFM.Application.Features.Correspondences.Commands.PermanentlyDeleteCorrespondence
{
    public class PermanentlyDeleteCorrespondenceCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }
    }
}
