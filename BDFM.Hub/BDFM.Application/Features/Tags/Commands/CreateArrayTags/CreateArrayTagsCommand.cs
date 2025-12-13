namespace BDFM.Application.Features.Tags.Commands.CreateArrayTags;

public class CreateArrayTagsCommand : IRequest<Response<bool>>
{
    public Guid CorrespondenceId { get; set; }
    public bool IsAll { get; set; } = false;
    public List<DataTDO> Data { get; set; } = new List<DataTDO>();
}

public class DataTDO
{
    public string Name { get; set; } = string.Empty;
    public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;
    public RecipientTypeEnum ToPrimaryRecipientType { get; set; }
    public Guid ToPrimaryRecipientId { get; set; }
}
