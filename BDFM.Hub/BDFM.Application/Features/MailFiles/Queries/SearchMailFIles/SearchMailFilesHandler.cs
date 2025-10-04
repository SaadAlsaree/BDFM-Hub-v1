using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.MailFiles.Queries.SearchMailFIles
{
    public class SearchMailFilesHandler : IRequestHandler<SearchMailFilesQuery, Response<IEnumerable<SearchMailFilesVm>>>
    {
        private readonly IBaseRepository<MailFile> _mailFileRepository;

        public SearchMailFilesHandler(IBaseRepository<MailFile> mailFileRepository)
        {
            _mailFileRepository = mailFileRepository;
        }

        public async Task<Response<IEnumerable<SearchMailFilesVm>>> Handle(SearchMailFilesQuery request, CancellationToken cancellationToken)
        {
            var result = await _mailFileRepository.GetAsync<SearchMailFilesVm>(
                filter: x => string.IsNullOrEmpty(request.SearchTerm) ||
                             EF.Functions.Like(x.FileNumber, request.SearchTerm + "%") ||
                             EF.Functions.Like(x.Name, request.SearchTerm + "%"),
                selector: x => new SearchMailFilesVm
                {
                    Id = x.Id,
                    FileNumber = x.FileNumber,
                    Name = x.Name,
                    Subject = x.Subject,
                    CreateAt = x.CreateAt,
                    CreateBy = x.CreateBy,
                    Status = (int)x.StatusId,
                    StatusName = x.StatusId.ToString(),
                    CorrespondenceCount = x.Correspondences.Count()
                },
                orderBy: q => q.OrderBy(x => x.FileNumber),
                take: 50,
                cancellationToken: cancellationToken
            );

            return SuccessMessage.Get.ToSuccessMessage(result.Item1);
        }
    }
}
