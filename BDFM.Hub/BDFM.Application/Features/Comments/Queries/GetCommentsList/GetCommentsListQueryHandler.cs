using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Comments.Queries.GetCommentsList;

public class GetCommentsListQueryHandler :
    GetAllWithCountHandler<CorrespondenceComment, CommentListViewModel, GetCommentsListQuery>,
    IRequestHandler<GetCommentsListQuery, Response<PagedResult<CommentListViewModel>>>
{
    public GetCommentsListQueryHandler(IBaseRepository<CorrespondenceComment> repository) : base(repository)
    {
    }

    public override Expression<Func<CorrespondenceComment, CommentListViewModel>> Selector =>
        cc => new CommentListViewModel
        {
            Id = cc.Id,
            CorrespondenceId = cc.CorrespondenceId,
            Text = cc.Text,
            Visibility = cc.Visibility,
            EmployeeName = cc.EmployeeName,
            UserLogin = cc.UserLogin,
            EmployeeUnitName = cc.EmployeeUnitName,
            IsEdited = cc.IsEdited,
            CreateAt = cc.CreateAt,
            Status = (int)cc.StatusId,
            RepliesCount = cc.Replies.Count,
            ParentCommentId = cc.ParentCommentId
        };

    public override Func<IQueryable<CorrespondenceComment>, IOrderedQueryable<CorrespondenceComment>> OrderBy =>
        query => query.OrderByDescending(cc => cc.CreateAt);

    private IQueryable<CorrespondenceComment> ApplyFilters(IQueryable<CorrespondenceComment> query, GetCommentsListQuery request)
    {
        query = query.Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(cc =>
                cc.Text.Contains(request.SearchTerm) ||
                cc.EmployeeName.Contains(request.SearchTerm) ||
                cc.UserLogin.Contains(request.SearchTerm));
        }

        if (request.CorrespondenceId.HasValue)
        {
            query = query.Where(cc => cc.CorrespondenceId == request.CorrespondenceId.Value);
        }

        if (request.UserId.HasValue)
        {
            query = query.Where(cc => cc.UserId == request.UserId.Value);
        }

        if (request.Visibility.HasValue)
        {
            query = query.Where(cc => cc.Visibility == request.Visibility.Value);
        }

        if (request.StatusId.HasValue)
        {
            query = query.Where(cc => cc.StatusId == (Status)request.StatusId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(cc => cc.CreateAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(cc => cc.CreateAt <= request.ToDate.Value.AddDays(1).AddSeconds(-1));
        }

        if (request.ParentCommentId.HasValue)
        {
            query = query.Where(cc => cc.ParentCommentId == request.ParentCommentId.Value);
        }

        return query;
    }

    public async Task<Response<PagedResult<CommentListViewModel>>> Handle(GetCommentsListQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
