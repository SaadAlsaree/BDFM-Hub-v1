namespace BDFM.Application.Features.Correspondences.Commands.ToggleStarCorrespondence
{
    public class ToggleStarCorrespondenceCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }
    }
}
