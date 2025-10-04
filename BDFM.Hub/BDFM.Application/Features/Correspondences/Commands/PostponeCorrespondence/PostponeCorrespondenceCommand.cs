namespace BDFM.Application.Features.Correspondences.Commands.PostponeCorrespondence
{
    public class PostponeCorrespondenceCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }

        // Date until which to postpone the correspondence
        public DateTime PostponeUntilDateTime { get; set; }
    }
}
