using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogList;

public class GetAuditLogListQueryHandler :
    GetAllWithCountHandler<AuditLog, AuditLogListViewModel, GetAuditLogListQuery>,
    IRequestHandler<GetAuditLogListQuery, Response<PagedResult<AuditLogListViewModel>>>
{
    public GetAuditLogListQueryHandler(IBaseRepository<AuditLog> repository)
        : base(repository)
    {
    }

    public override Expression<Func<AuditLog, AuditLogListViewModel>> Selector => log => new AuditLogListViewModel
    {
        Id = log.Id,
        UserId = log.UserId,
        UserName = log.User != null ? log.User.FullName : null,
        Timestamp = log.Timestamp,
        Action = log.Action,
        AffectedEntity = log.AffectedEntity,
        AffectedEntityId = log.AffectedEntityId,
        Details = log.Details,
        IpAddress = log.IpAddress
    };

    public override Func<IQueryable<AuditLog>, IOrderedQueryable<AuditLog>> OrderBy =>
        query => query.OrderByDescending(log => log.Timestamp);

    public async Task<Response<PagedResult<AuditLogListViewModel>>> Handle(GetAuditLogListQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query();

        // Include User relationship
        query = query.Include(log => log.User);

        // Apply filters
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(log =>
                (log.Action != null && log.Action.ToLower().Contains(searchTerm)) ||
                (log.AffectedEntity != null && log.AffectedEntity.ToLower().Contains(searchTerm)) ||
                (log.Details != null && log.Details.ToLower().Contains(searchTerm)) ||
                (log.IpAddress != null && log.IpAddress.ToLower().Contains(searchTerm)) ||
                (log.User != null && log.User.FullName.ToLower().Contains(searchTerm))
            );
        }

        if (!string.IsNullOrEmpty(request.Action))
        {
            query = query.Where(log => log.Action == request.Action);
        }

        if (!string.IsNullOrEmpty(request.AffectedEntity))
        {
            query = query.Where(log => log.AffectedEntity == request.AffectedEntity);
        }

        if (request.UserId.HasValue)
        {
            query = query.Where(log => log.UserId == request.UserId);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(log => log.Timestamp >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            // Add a day to include the whole day
            var endDate = request.ToDate.Value.AddDays(1).AddSeconds(-1);
            query = query.Where(log => log.Timestamp <= endDate);
        }

        // Apply pagination and get results
        var result = await query
            .OrderByDescending(log => log.Timestamp)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(Selector)
            .ToListAsync(cancellationToken);

        var count = await query.CountAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<AuditLogListViewModel>>(null!);

        var pagedResult = new PagedResult<AuditLogListViewModel>
        {
            Items = result,
            TotalCount = count
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
