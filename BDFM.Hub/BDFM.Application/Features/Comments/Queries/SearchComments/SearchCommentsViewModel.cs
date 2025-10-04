namespace BDFM.Application.Features.Comments.Queries.SearchComments;

public class SearchCommentsViewModel
{
    public Guid Id { get; set; }
    public Guid CorrespondenceId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string UserLogin { get; set; } = string.Empty;
    public string EmployeeUnitName { get; set; } = string.Empty;
    public CommentVisibility Visibility { get; set; }
    public DateTime CreateAt { get; set; }
    public Guid? CreateBy { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int RepliesCount { get; set; }
}
