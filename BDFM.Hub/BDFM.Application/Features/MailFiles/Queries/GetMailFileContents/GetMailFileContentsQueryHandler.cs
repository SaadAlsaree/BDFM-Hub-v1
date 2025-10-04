using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileContents;

public class GetMailFileContentsQueryHandler :
    IRequestHandler<GetMailFileContentsQuery, Response<MailFileWithContentsViewModel>>
{
    private readonly IBaseRepository<MailFile> _mailFileRepository;
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;

    public GetMailFileContentsQueryHandler(
        IBaseRepository<MailFile> mailFileRepository,
        IBaseRepository<Correspondence> correspondenceRepository)
    {
        _mailFileRepository = mailFileRepository ?? throw new ArgumentNullException(nameof(mailFileRepository));
        _correspondenceRepository = correspondenceRepository ?? throw new ArgumentNullException(nameof(correspondenceRepository));
    }

    public async Task<Response<MailFileWithContentsViewModel>> Handle(GetMailFileContentsQuery request, CancellationToken cancellationToken)
    {
        // Get the mail file
        var mailFile = await _mailFileRepository
            .Query(mf => mf.Id == request.MailFileId)
            .Select(mf => new MailFileWithContentsViewModel
            {
                Id = mf.Id,
                FileNumber = mf.FileNumber,
                Name = mf.Name,
                Subject = mf.Subject,
                CreateAt = mf.CreateAt,
                CreateBy = mf.CreateBy,
                Status = (int)mf.StatusId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (mailFile == null)
        {
            return Response<MailFileWithContentsViewModel>.Fail(
                new List<object> { "Mail file not found" },
                new MessageResponse { Code = "Error4004", Message = "Mail file not found" }
            );
        }

        // Set status name
        mailFile.StatusName = ((Status)mailFile.Status).GetDisplayName();

        // Get the correspondences for this mail file with pagination
        var correspondencesQuery = _correspondenceRepository.Query(c => c.FileId == request.MailFileId);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            correspondencesQuery = correspondencesQuery.Where(c =>
                c.Subject.Contains(request.SearchTerm) ||
                (c.BodyText != null && c.BodyText.Contains(request.SearchTerm)) ||
                (c.ExternalReferenceNumber != null && c.ExternalReferenceNumber.Contains(request.SearchTerm)) ||
                (c.MailNum != null && c.MailNum.Contains(request.SearchTerm))
            );
        }

        if (request.StatusId.HasValue)
        {
            correspondencesQuery = correspondencesQuery.Where(c => c.StatusId == (Status)request.StatusId.Value);
        }

        if (request.FromDate.HasValue)
        {
            correspondencesQuery = correspondencesQuery.Where(c => c.CreateAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            correspondencesQuery = correspondencesQuery.Where(c => c.CreateAt <= request.ToDate.Value.AddDays(1).AddSeconds(-1));
        }

        // Get count of correspondences
        var count = await correspondencesQuery.CountAsync(cancellationToken);

        // Apply pagination and select view model
        var correspondences = await correspondencesQuery
            .OrderByDescending(c => c.CreateAt)
            .ApplyPagination(request)
            .Select(c => new CorrespondenceViewModel
            {
                Id = c.Id,
                Subject = c.Subject,
                BodyText = c.BodyText,
                ExternalReferenceNumber = c.ExternalReferenceNumber,
                ExternalReferenceDate = c.ExternalReferenceDate != null
                    ? DateTime.Parse(c.ExternalReferenceDate.ToString()!)
                    : null,
                InternalReferenceNumber = c.MailNum,
                InternalDate = c.MailDate != null
                    ? DateTime.Parse(c.MailDate.ToString()!)
                    : null,
                CorrespondenceType = (int)c.CorrespondenceType,
                Status = (int)c.StatusId,
                CreateAt = c.CreateAt,
                AttachmentCount = c.AttachmentCount,
                HasAttachments = c.HasAttachments
            })
            .ToListAsync(cancellationToken);

        // Set display names
        foreach (var correspondence in correspondences)
        {
            correspondence.StatusName = ((Status)correspondence.Status).GetDisplayName();
            correspondence.CorrespondenceTypeName = ((CorrespondenceTypeEnum)correspondence.CorrespondenceType).GetDisplayName();
        }

        // Set correspondences in the result
        mailFile.Correspondences = new PagedResult<CorrespondenceViewModel>
        {
            Items = correspondences,
            TotalCount = count
        };

        return Response<MailFileWithContentsViewModel>.Success(mailFile);
    }
}
