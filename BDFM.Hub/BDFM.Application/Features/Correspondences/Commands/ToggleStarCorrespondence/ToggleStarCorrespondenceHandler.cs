namespace BDFM.Application.Features.Correspondences.Commands.ToggleStarCorrespondence
{
    public class ToggleStarCorrespondenceHandler : IRequestHandler<ToggleStarCorrespondenceCommand, Response<bool>>
    {
        public Task<Response<bool>> Handle(ToggleStarCorrespondenceCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
