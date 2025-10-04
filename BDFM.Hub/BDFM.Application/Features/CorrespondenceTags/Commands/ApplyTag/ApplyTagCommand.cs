namespace BDFM.Application.Features.CorrespondenceTags.Commands.ApplyTag
{
    public class ApplyTagCommand : IRequest<Response<bool>>
    {
        public Guid CorrespondenceId { get; set; }
        public Guid TagId { get; set; }
        public Guid AppliedByUserId { get; set; }
        public string? Notes { get; set; }
        public bool IsPrivateTag { get; set; } = false;
        public int Priority { get; set; } = 0;
    }
}
