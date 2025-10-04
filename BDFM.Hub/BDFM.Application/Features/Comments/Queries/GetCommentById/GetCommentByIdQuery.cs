namespace BDFM.Application.Features.Comments.Queries.GetCommentById;

public class GetCommentByIdQuery : IRequest<Response<CommentViewModel>>
{
    public Guid Id { get; set; }
}
