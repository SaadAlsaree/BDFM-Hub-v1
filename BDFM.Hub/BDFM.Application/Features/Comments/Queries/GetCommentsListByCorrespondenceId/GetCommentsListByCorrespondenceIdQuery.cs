namespace BDFM.Application.Features.Comments.Queries.GetCommentsListByCorrespondenceId;

public class GetCommentsListByCorrespondenceIdQuery : IRequest<Response<List<CommentByCorrespondenceViewModel>>>
{
    [Required]
    public Guid CorrespondenceId { get; set; }

    public bool IncludeReplies { get; set; } = true;
}
