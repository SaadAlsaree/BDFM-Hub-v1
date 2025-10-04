namespace BDFM.Application.Features.Comments.Queries.GetCommentsList;

public class CommentListViewModel
{
    public Guid Id { get; set; }
    public Guid CorrespondenceId { get; set; }
    public string Text { get; set; } = string.Empty;
    public CommentVisibility Visibility { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string UserLogin { get; set; } = string.Empty;
    public string EmployeeUnitName { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public DateTime CreateAt { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int RepliesCount { get; set; }
    public Guid? ParentCommentId { get; set; }
}
