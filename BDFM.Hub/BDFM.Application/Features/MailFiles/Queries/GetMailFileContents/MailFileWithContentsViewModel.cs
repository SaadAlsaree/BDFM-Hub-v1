using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileContents;

public class MailFileWithContentsViewModel
{
    public Guid Id { get; set; }
    public string FileNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public DateTime CreateAt { get; set; }
    public Guid? CreateBy { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public PagedResult<CorrespondenceViewModel> Correspondences { get; set; } = new();
}

public class CorrespondenceViewModel
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? BodyText { get; set; }
    public string? ExternalReferenceNumber { get; set; }
    public DateTime? ExternalReferenceDate { get; set; }
    public string? InternalReferenceNumber { get; set; }
    public DateTime? InternalDate { get; set; }
    public int CorrespondenceType { get; set; }
    public string CorrespondenceTypeName { get; set; } = string.Empty;
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreateAt { get; set; }
    public int AttachmentCount { get; set; }
    public bool HasAttachments { get; set; }
}
