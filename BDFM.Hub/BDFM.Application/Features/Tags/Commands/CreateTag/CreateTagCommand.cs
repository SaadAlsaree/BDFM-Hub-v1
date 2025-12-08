namespace BDFM.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommand : IRequest<Response<bool>>
{
        public Guid CorrespondenceId { get; set; }
        public string? Name { get; set; } = string.Empty;
        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;
        public bool IsAll { get; set; } = false;
        public RecipientTypeEnum ToPrimaryRecipientType { get; set; }

        public Guid ToPrimaryRecipientId { get; set; }

}
