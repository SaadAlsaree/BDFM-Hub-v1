using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Delegations.Queries.GetDelegationList;

public class GetDelegationListQueryHandler :
    GetAllWithCountHandler<Delegation, DelegationListViewModel, GetDelegationListQuery>,
    IRequestHandler<GetDelegationListQuery, Response<PagedResult<DelegationListViewModel>>>
{
    public GetDelegationListQueryHandler(IBaseRepository<Delegation> repository) : base(repository)
    {
    }

    public override Expression<Func<Delegation, DelegationListViewModel>> Selector => d => new DelegationListViewModel
    {
        Id = d.Id,
        DelegatorUserId = d.DelegatorUserId,
        DelegatorUserName = d.DelegatorUser != null ? d.DelegatorUser.FullName : string.Empty,
        DelegateeUserId = d.DelegateeUserId,
        DelegateeUserName = d.DelegateeUser != null ? d.DelegateeUser.FullName : string.Empty,
        PermissionId = d.PermissionId,
        PermissionName = d.Permission != null ? d.Permission.Name : null,
        RoleId = d.RoleId,
        RoleName = d.Role != null ? d.Role.Name : null,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        IsActive = d.IsActive,
        StatusId = (int)d.StatusId,
        StatusName = d.StatusId.GetDisplayName(),
        CreatedDate = d.CreateAt
    };

    public override Func<IQueryable<Delegation>, IOrderedQueryable<Delegation>> OrderBy =>
        query => query.OrderByDescending(d => d.CreateAt);

    public async Task<Response<PagedResult<DelegationListViewModel>>> Handle(
        GetDelegationListQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query();

        // Apply filters manually since we need custom filtering
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim().ToLower();
            query = query.Where(d =>
                (d.DelegatorUser.FullName != null && d.DelegatorUser.FullName.ToLower().Contains(searchTerm)) ||
                (d.DelegateeUser.FullName != null && d.DelegateeUser.FullName.ToLower().Contains(searchTerm)) ||
                (d.Role != null && d.Role.Name != null && d.Role.Name.ToLower().Contains(searchTerm)) ||
                (d.Permission != null && d.Permission.Name != null && d.Permission.Name.ToLower().Contains(searchTerm))
            );
        }

        if (request.DelegatorUserId.HasValue)
        {
            query = query.Where(d => d.DelegatorUserId == request.DelegatorUserId.Value);
        }

        if (request.DelegateeUserId.HasValue)
        {
            query = query.Where(d => d.DelegateeUserId == request.DelegateeUserId.Value);
        }

        if (request.PermissionId.HasValue)
        {
            query = query.Where(d => d.PermissionId == request.PermissionId.Value);
        }

        if (request.RoleId.HasValue)
        {
            query = query.Where(d => d.RoleId == request.RoleId.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(d => d.IsActive == request.IsActive.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(d => d.StartDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(d => d.EndDate <= request.ToDate.Value);
        }

        if (request.StatusId.HasValue)
        {
            query = query.Where(d => d.StatusId == (Status)request.StatusId.Value);
        }

        // Include related entities for proper mapping
        query = query.Include(d => d.DelegatorUser)
                    .Include(d => d.DelegateeUser)
                    .Include(d => d.Permission)
                    .Include(d => d.Role);

        // Apply ordering
        var orderedQuery = OrderBy(query);

        // Apply pagination
        var paginatedQuery = orderedQuery
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize);

        // Execute queries
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await paginatedQuery.Select(Selector).ToListAsync(cancellationToken);

        // Create paged result
        var pagedResult = new PagedResult<DelegationListViewModel>
        {
            Items = items,
            TotalCount = totalCount
        };

        if (!items.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<DelegationListViewModel>>(null!);

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
