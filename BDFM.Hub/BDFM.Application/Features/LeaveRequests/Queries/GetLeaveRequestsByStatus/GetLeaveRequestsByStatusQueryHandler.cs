using BDFM.Application.Features.LeaveRequests.Queries.GetAllLeaveRequests;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestsByStatus;

public class GetLeaveRequestsByStatusQueryHandler : IRequestHandler<GetLeaveRequestsByStatusQuery, Response<PagedResult<LeaveRequestListViewModel>>>
{
    private readonly IBaseRepository<LeaveRequest> _repository;

    public GetLeaveRequestsByStatusQueryHandler(IBaseRepository<LeaveRequest> repository)
    {
        _repository = repository;
    }

    public async Task<Response<PagedResult<LeaveRequestListViewModel>>> Handle(GetLeaveRequestsByStatusQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query()
            .Where(x => !x.IsDeleted && x.Status == request.Status)
            .Include(x => x.OrganizationalUnit)
            .Include(x => x.ApprovedByUser)
            .AsQueryable();

        // Apply filters
        if (request.OrganizationalUnitId.HasValue)
        {
            query = query.Where(x => x.OrganizationalUnitId == request.OrganizationalUnitId.Value);
        }

        if (!string.IsNullOrEmpty(request.EmployeeId))
        {
            query = query.Where(x => x.EmployeeId == request.EmployeeId);
        }

        // Get total count
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

