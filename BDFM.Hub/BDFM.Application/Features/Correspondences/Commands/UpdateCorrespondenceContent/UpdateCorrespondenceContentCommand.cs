namespace BDFM.Application.Features.Correspondences.Commands.UpdateCorrespondenceContent
{
    public class UpdateCorrespondenceContentCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID (required)
        public Guid CorrespondenceId { get; set; }

        // Optional fields to update
        public string Subject { get; set; }
        public string BodyText { get; set; }
        public SecrecyLevelEnum? SecrecyLevel { get; set; }
        public PriorityLevelEnum? PriorityLevel { get; set; }
        public PersonalityLevelEnum? PersonalityLevel { get; set; }
        public Guid? UpdatedByUserId { get; set; }

    }
}
