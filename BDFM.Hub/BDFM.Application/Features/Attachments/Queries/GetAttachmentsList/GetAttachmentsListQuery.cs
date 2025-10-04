using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsList
{
    public class GetAttachmentsListQuery : IRequest<Response<PagedResult<AttachmentListViewModel>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        // Filter properties
        public Guid? PrimaryTableId { get; set; }
        public TableNames? TableName { get; set; }
        public int? StatusId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? FileExtension { get; set; }
    }
}
