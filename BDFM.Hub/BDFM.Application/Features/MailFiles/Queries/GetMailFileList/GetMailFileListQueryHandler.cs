using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileList;

public class GetMailFileListQueryHandler :
    GetAllWithCountHandler<MailFile, MailFileListViewModel, GetMailFileListQuery>,
    IRequestHandler<GetMailFileListQuery, Response<PagedResult<MailFileListViewModel>>>
{
    public GetMailFileListQueryHandler(IBaseRepository<MailFile> repository) : base(repository)
    {
    }

    public override Expression<Func<MailFile, MailFileListViewModel>> Selector =>
        mf => new MailFileListViewModel
        {
            Id = mf.Id,
            FileNumber = mf.FileNumber,
            Name = mf.Name,
            Subject = mf.Subject ?? string.Empty,
            CreateAt = mf.CreateAt,
            Status = (int)mf.StatusId,
            CorrespondenceCount = mf.Correspondences.Count
        };

    public override Func<IQueryable<MailFile>, IOrderedQueryable<MailFile>> OrderBy =>
        query => query.OrderByDescending(mf => mf.CreateAt);

    private IQueryable<MailFile> ApplyFilters(IQueryable<MailFile> query, GetMailFileListQuery request)
    {
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(mf =>
                mf.FileNumber.Contains(request.SearchTerm) ||
                (mf.Subject != null && mf.Subject.Contains(request.SearchTerm)));
        }

        if (request.StatusId.HasValue)
        {
            query = query.Where(mf => mf.StatusId == (Status)request.StatusId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(mf => mf.CreateAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(mf => mf.CreateAt <= request.ToDate.Value.AddDays(1).AddSeconds(-1));
        }

        return query;
    }

    public async Task<Response<PagedResult<MailFileListViewModel>>> Handle(GetMailFileListQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
