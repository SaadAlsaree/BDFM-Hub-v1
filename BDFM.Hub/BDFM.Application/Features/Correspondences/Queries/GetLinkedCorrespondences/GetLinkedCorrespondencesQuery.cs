namespace BDFM.Application.Features.Correspondences.Queries.GetLinkedCorrespondences
{
    public class GetLinkedCorrespondencesQuery : IRequest<Response<List<LinkedCorrespondenceVm>>>
    {
        public Guid CorrespondenceId { get; set; }
    }
}
