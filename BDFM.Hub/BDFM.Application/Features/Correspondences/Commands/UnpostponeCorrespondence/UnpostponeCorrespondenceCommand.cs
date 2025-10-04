namespace BDFM.Application.Features.Correspondences.Commands.UnpostponeCorrespondence
{
    public class UnpostponeCorrespondenceCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }
    }
}
