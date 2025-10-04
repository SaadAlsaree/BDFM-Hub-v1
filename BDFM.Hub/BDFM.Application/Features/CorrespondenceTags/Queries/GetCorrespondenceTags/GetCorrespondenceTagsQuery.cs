namespace BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondenceTags
{
    public class GetCorrespondenceTagsQuery : IRequest<Response<IEnumerable<CorrespondenceTagViewModel>>>
    {
        public Guid CorrespondenceId { get; set; }
        public Guid? UserId { get; set; } // For filtering private tags
        public bool IncludePrivateTags { get; set; } = false;
    }
}
