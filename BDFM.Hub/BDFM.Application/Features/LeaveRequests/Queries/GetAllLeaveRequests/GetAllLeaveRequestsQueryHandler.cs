using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;

public class GetAllLeaveRequestsQueryHandler : IRequestHandler<GetAllLeaveRequestsQuery, Response<PagedResult<LeaveRequestListViewModel>>>
{
    private readonly IBaseRepository<LeaveRequest> _repository;

    public GetAllLeaveRequestsQueryHandler(IBaseRepository<LeaveRequest> repository)
    {
        _repository = repository;
    }

    public async Task<Response<PagedResult<LeaveRequestListViewModel>>> Handle(GetAllLeaveRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query()
            .Where(x => !x.IsDeleted)
            .Include(x => x.OrganizationalUnit)
            .Include(x => x.ApprovedByUser)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.EmployeeId))
        {
            query = query.Where(x => x.EmployeeId == request.EmployeeId);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        if (request.LeaveType.HasValue)
        {
            query = query.Where(x => x.LeaveType == request.LeaveType.Value);
        }

        if (request.StartDateFrom.HasValue)
        {
            query = query.Where(x => x.StartDate >= request.StartDateFrom.Value);
        }

        if (request.StartDateTo.HasValue)
        {
            query = query.Where(x => x.StartDate <= request.StartDateTo.Value);
        }

        if (request.EndDateFrom.HasValue)
        {
            query = query.Where(x => x.EndDate >= request.EndDateFrom.Value);
        }

        if (request.EndDateTo.HasValue)
        {
            query = query.Where(x => x.EndDate <= request.EndDateTo.Value);
        }

        if (request.OrganizationalUnitId.HasValue)
        {
            query = query.Where(x => x.OrganizationalUnitId == request.OrganizationalUnitId.Value);
        }

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(x =>
                (x.EmployeeName != null && x.EmployeeName.ToLower().Contains(searchTerm)) ||
                (x.EmployeeNumber != null && x.EmployeeNumber.ToLower().Contains(searchTerm)) ||
                (x.RequestNumber != null && x.RequestNumber.ToLower().Contains(searchTerm)));
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and ordering
        var result = await query
            .OrderByDescending(x => x.CreateAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new LeaveRequestListViewModel
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                EmployeeNumber = x.EmployeeNumber,
                EmployeeName = x.EmployeeName,
                OrganizationalUnitId = x.OrganizationalUnitId,
                OrganizationalUnitName = x.OrganizationalUnit != null ? x.OrganizationalUnit.UnitName : null,
                LeaveType = x.LeaveType,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                RequestedDays = x.RequestedDays,
                ApprovedDays = x.ApprovedDays,
                // HR Balance Snapshot (simplified for list view)
                AvailableBalance = x.AvailableBalance,
                Status = x.Status,
                RequestNumber = x.RequestNumber,
                IsInterrupted = x.IsInterrupted,
                ApprovedAt = x.ApprovedAt,
                ApprovedByUserName = x.ApprovedByUser != null ? x.ApprovedByUser.FullName : null,
                CreateAt = x.CreateAt,
                StatusId = (int)x.StatusId
            })
            .ToListAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<LeaveRequestListViewModel>>(null!);

        // Set enum display names
        result.ForEach(x =>
        {
            x.LeaveTypeName = x.LeaveType.GetDisplayName();
            x.StatusName = x.Status.GetDisplayName();
        });

        var pagedResult = new PagedResult<LeaveRequestListViewModel>
        {
            Items = result,
            TotalCount = totalCount
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}

