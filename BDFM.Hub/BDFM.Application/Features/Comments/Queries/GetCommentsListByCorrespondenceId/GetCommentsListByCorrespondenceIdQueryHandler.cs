using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.Comments.Queries.GetCommentsListByCorrespondenceId;

public class GetCommentsListByCorrespondenceIdQueryHandler :
    IRequestHandler<GetCommentsListByCorrespondenceIdQuery, Response<List<CommentByCorrespondenceViewModel>>>
{
    private readonly IBaseRepository<CorrespondenceComment> _repository;

    public GetCommentsListByCorrespondenceIdQueryHandler(IBaseRepository<CorrespondenceComment> repository)
    {
        _repository = repository;
    }

    public async Task<Response<List<CommentByCorrespondenceViewModel>>> Handle(GetCommentsListByCorrespondenceIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _repository.GetQueryable()
                .Where(cc => cc.CorrespondenceId == request.CorrespondenceId);

            var allComments = await query
                .OrderBy(cc => cc.CreateAt)
                .Select(cc => new CommentByCorrespondenceViewModel
                {
                    Id = cc.Id,
                    CorrespondenceId = cc.CorrespondenceId,
                    Text = cc.Text,
                    WorkflowStepId = cc.WorkflowStepId,
                    ParentCommentId = cc.ParentCommentId,
                    Visibility = cc.Visibility,
                    UserId = cc.UserId,
                    EmployeeName = cc.EmployeeName,
                    UserLogin = cc.UserLogin,
                    EmployeeUnitName = cc.EmployeeUnitName,
                    EmployeeUnitCode = cc.EmployeeUnitCode,
                    IsEdited = cc.IsEdited,
                    CanEdit = cc.CanEdit,
                    CanDelete = cc.CanDelete,
                    CreateAt = cc.CreateAt,
                    CreateBy = cc.CreateBy,
                    Status = (int)cc.StatusId
                })
                .ToListAsync(cancellationToken);

            // Populate StatusName dynamically
            foreach (var comment in allComments)
            {
                comment.StatusName = ((Status)comment.Status).ToString();
            }

            if (!request.IncludeReplies)
            {
                return Response<List<CommentByCorrespondenceViewModel>>.Success(allComments);
            }

            // Build hierarchical structure
            var topLevelComments = allComments.Where(c => c.ParentCommentId == null).ToList();
            var commentLookup = allComments.ToLookup(c => c.ParentCommentId);

            foreach (var comment in topLevelComments)
            {
                PopulateReplies(comment, commentLookup);
            }

            return Response<List<CommentByCorrespondenceViewModel>>.Success(topLevelComments);
        }
        catch (Exception ex)
        {
            return Response<List<CommentByCorrespondenceViewModel>>.Fail(
                new MessageResponse { Code = "Error5000", Message = $"Error retrieving comments: {ex.Message}" });
        }
    }

    private void PopulateReplies(CommentByCorrespondenceViewModel comment, ILookup<Guid?, CommentByCorrespondenceViewModel> commentLookup)
    {
        var replies = commentLookup[comment.Id].ToList();
        comment.Replies = replies;

        foreach (var reply in replies)
        {
            PopulateReplies(reply, commentLookup);
        }
    }
}
