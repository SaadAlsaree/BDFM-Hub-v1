namespace BDFM.Application.Features.Correspondences.Commands.LinkCorrespondences
{
    public class LinkCorrespondencesCommand : IRequest<Response<Guid>>
    {
        // Source correspondence ID (the one that refers to another)
        public Guid SourceCorrespondenceId { get; set; }

        // Target correspondence ID (the one being referred to)
        public Guid LinkedCorrespondenceId { get; set; }

        // Type of link
        public CorrespondenceLinkType LinkType { get; set; }

        // Optional notes about this link
        public string? Notes { get; set; }
    }
}
