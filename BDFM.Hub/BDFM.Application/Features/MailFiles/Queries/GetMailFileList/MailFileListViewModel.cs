namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileList;

public class MailFileListViewModel
{
    public Guid Id { get; set; }
    public string FileNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public DateTime CreateAt { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int CorrespondenceCount { get; set; }
}
