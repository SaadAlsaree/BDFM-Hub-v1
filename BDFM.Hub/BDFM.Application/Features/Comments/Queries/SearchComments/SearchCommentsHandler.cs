using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.Comments.Queries.SearchComments;

public class SearchCommentsHandler : IRequestHandler<SearchCommentsQuery, Response<IEnumerable<SearchCommentsViewModel>>>
{
    private readonly IBaseRepository<CorrespondenceComment> _commentRepository;

    public SearchCommentsHandler(IBaseRepository<CorrespondenceComment> commentRepository)
    {
        _commentRepository = commentRepository;
    }

    public async Task<Response<IEnumerable<SearchCommentsViewModel>>> Handle(SearchCommentsQuery request, CancellationToken cancellationToken)
    {
        var result = await _commentRepository.GetAsync<SearchCommentsViewModel>(
            filter: x => (string.IsNullOrEmpty(request.SearchTerm) ||
                         EF.Functions.Like(x.Text, "%" + request.SearchTerm + "%") ||
                         EF.Functions.Like(x.EmployeeName, "%" + request.SearchTerm + "%") ||
                         EF.Functions.Like(x.UserLogin, "%" + request.SearchTerm + "%")) &&
                         (!request.CorrespondenceId.HasValue || x.CorrespondenceId == request.CorrespondenceId.Value),
            selector: x => new SearchCommentsViewModel
            {
                Id = x.Id,
                CorrespondenceId = x.CorrespondenceId,
                Text = x.Text,
                EmployeeName = x.EmployeeName,
                UserLogin = x.UserLogin,
                EmployeeUnitName = x.EmployeeUnitName,
                Visibility = x.Visibility,
                CreateAt = x.CreateAt,
                CreateBy = x.CreateBy,
                Status = (int)x.StatusId,
                StatusName = x.StatusId.ToString(),
                RepliesCount = x.Replies.Count()
            },
            orderBy: q => q.OrderByDescending(x => x.CreateAt),
            take: 50,
            cancellationToken: cancellationToken
        );

        return SuccessMessage.Get.ToSuccessMessage(result.Item1);
    }
}
