namespace BDFM.Application.Features.Tags.Commands.UpdateTag;

public class UpdateTagCommand : IRequest<Response<bool>>
{
        public Guid Id { get; set; }
     public Guid CorrespondenceId { get; set; }
        public string? Name { get; set; } = string.Empty;
        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;
        public bool IsAll { get; set; } = false;
        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }

        public Guid ToPrimaryRecipientId { get; set; }
}
