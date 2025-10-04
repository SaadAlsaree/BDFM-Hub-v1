namespace BDFM.Application.Features.Comments.Commands.CreateComment;

public class CreateCommentCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid CorrespondenceId { get; set; }

    [Required]
    [StringLength(2000)]
    public string Text { get; set; } = string.Empty;

    public Guid? WorkflowStepId { get; set; }

    public Guid? ParentCommentId { get; set; }

    public CommentVisibility Visibility { get; set; } = CommentVisibility.InternalUsers;
}
