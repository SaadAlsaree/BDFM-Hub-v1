namespace BDFM.Application.Features.Comments.Commands.UpdateComment;

public class UpdateCommentCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [StringLength(2000)]
    public string Text { get; set; } = string.Empty;

    public CommentVisibility Visibility { get; set; } = CommentVisibility.InternalUsers;
}
