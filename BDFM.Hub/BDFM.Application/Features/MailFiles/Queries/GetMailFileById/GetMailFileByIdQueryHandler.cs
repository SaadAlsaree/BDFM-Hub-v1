using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileById;

public class GetMailFileByIdQueryHandler :
    GetByIdHandler<MailFile, MailFileViewModel, GetMailFileByIdQuery>,
    IRequestHandler<GetMailFileByIdQuery, Response<MailFileViewModel>>
{
    public GetMailFileByIdQueryHandler(IBaseRepository<MailFile> repository) : base(repository)
    {
    }

    public override Expression<Func<MailFile, bool>> IdPredicate(GetMailFileByIdQuery request)
    {
        return mf => mf.Id == request.Id;
    }

    public override Expression<Func<MailFile, MailFileViewModel>> Selector =>
        mf => new MailFileViewModel
        {
            Id = mf.Id,
            FileNumber = mf.FileNumber,
            Name = mf.Name,
            Subject = mf.Subject,
            CreateAt = mf.CreateAt,
            CreateBy = mf.CreateBy,
            Status = (int)mf.StatusId,
            CorrespondenceCount = mf.Correspondences.Count
        };

    public async Task<Response<MailFileViewModel>> Handle(GetMailFileByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
