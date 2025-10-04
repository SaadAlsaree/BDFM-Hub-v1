using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Comments.Queries.GetCommentById;

public class GetCommentByIdQueryHandler :
    GetByIdHandler<CorrespondenceComment, CommentViewModel, GetCommentByIdQuery>,
    IRequestHandler<GetCommentByIdQuery, Response<CommentViewModel>>
{
    public GetCommentByIdQueryHandler(IBaseRepository<CorrespondenceComment> repository) : base(repository)
    {
    }

    public override Expression<Func<CorrespondenceComment, bool>> IdPredicate(GetCommentByIdQuery request)
    {
        return cc => cc.Id == request.Id;
    }

    public override Expression<Func<CorrespondenceComment, CommentViewModel>> Selector =>
        cc => new CommentViewModel
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
            Status = (int)cc.StatusId,
            RepliesCount = cc.Replies.Count
        };

    public async Task<Response<CommentViewModel>> Handle(GetCommentByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
