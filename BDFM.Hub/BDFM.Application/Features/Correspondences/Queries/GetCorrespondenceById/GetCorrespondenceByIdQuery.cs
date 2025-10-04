namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceById
{
    public class GetCorrespondenceByIdQuery : IRequest<Response<CorrespondenceDetailVm>>
    {
        // Target correspondence ID
        public Guid Id { get; set; }

    }
}
