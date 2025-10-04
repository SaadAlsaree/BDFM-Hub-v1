namespace BDFM.Application.Features.Correspondences.Commands.ChangeCorrespondenceStatus
{
    public class ChangeCorrespondenceStatusCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }

        // The new status to set
        public CorrespondenceStatusEnum NewStatus { get; set; }
        public CorrespondenceTypeEnum? CorrespondenceType { get; set; }

        // Optional reason for the status change
        public string? Reason { get; set; }
    }
}
