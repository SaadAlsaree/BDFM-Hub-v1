using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsListByPrimaryTableId
{
    public class GetAttachmentsListByPrimaryTableIdQuery : IRequest<Response<PagedResult<AttachmentListByTableViewModel>>>, IPaginationQuery
    {
        public Guid PrimaryTableId { get; set; }
        public TableNames TableName { get; set; }

        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public string? SortField { get; set; }
        public string? SortDirection { get; set; }

        // Filter properties
        public string? SearchTerm { get; set; }
        public int? StatusId { get; set; }
        public string? FileExtension { get; set; }
    }
}
