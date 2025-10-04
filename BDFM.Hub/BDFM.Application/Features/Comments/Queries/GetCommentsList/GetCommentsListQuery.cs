using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Application.Helper.Pagination;
using BDFM.Application.Models;
using MediatR;
using System;

namespace BDFM.Application.Features.Comments.Queries.GetCommentsList;

public class GetCommentsListQuery : IRequest<Response<PagedResult<CommentListViewModel>>>, IPaginationQuery
{
    // IPaginationQuery implementation
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SortField { get; set; }
    public string? SortDirection { get; set; }

    // Filter properties
    public string? SearchTerm { get; set; }
    public Guid? CorrespondenceId { get; set; }
    public Guid? UserId { get; set; }
    public CommentVisibility? Visibility { get; set; }
    public int? StatusId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? ParentCommentId { get; set; }
}
