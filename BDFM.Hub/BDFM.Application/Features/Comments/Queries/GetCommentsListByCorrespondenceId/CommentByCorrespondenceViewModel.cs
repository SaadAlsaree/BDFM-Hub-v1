namespace BDFM.Application.Features.Comments.Queries.GetCommentsListByCorrespondenceId;

public class CommentByCorrespondenceViewModel
{
    public Guid Id { get; set; }
    public Guid CorrespondenceId { get; set; }
    public string Text { get; set; } = string.Empty;
    public Guid? WorkflowStepId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public CommentVisibility Visibility { get; set; }
    public Guid UserId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string UserLogin { get; set; } = string.Empty;
    public string EmployeeUnitName { get; set; } = string.Empty;
    public string EmployeeUnitCode { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public DateTime CreateAt { get; set; }
    public Guid? CreateBy { get; set; }
    public int Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public List<CommentByCorrespondenceViewModel> Replies { get; set; } = new List<CommentByCorrespondenceViewModel>();
}
