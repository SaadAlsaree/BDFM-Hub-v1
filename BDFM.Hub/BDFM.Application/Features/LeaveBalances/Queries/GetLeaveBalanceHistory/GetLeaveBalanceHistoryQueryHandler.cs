using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveBalances.Queries.GetLeaveBalanceHistory;

public class GetLeaveBalanceHistoryQueryHandler : IRequestHandler<GetLeaveBalanceHistoryQuery, Response<PagedResult<LeaveBalanceHistoryViewModel>>>
{
    private readonly IBaseRepository<LeaveBalanceHistory> _repository;

    public GetLeaveBalanceHistoryQueryHandler(IBaseRepository<LeaveBalanceHistory> repository)
    {
        _repository = repository;
    }

    public async Task<Response<PagedResult<LeaveBalanceHistoryViewModel>>> Handle(GetLeaveBalanceHistoryQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query()
            .Where(x => !x.IsDeleted)
            .Include(x => x.ChangedByUser)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.EmployeeId))
        {
            query = query.Where(x => x.EmployeeId == request.EmployeeId);
        }

        if (request.LeaveType.HasValue)
        {
            query = query.Where(x => x.LeaveType == request.LeaveType.Value);
        }

        if (request.ChangeDateFrom.HasValue)
        {
            query = query.Where(x => x.ChangeDate >= request.ChangeDateFrom.Value);
        }

        if (request.ChangeDateTo.HasValue)
        {
            query = query.Where(x => x.ChangeDate <= request.ChangeDateTo.Value);
        }

        if (!string.IsNullOrEmpty(request.ChangeType))
        {
            query = query.Where(x => x.ChangeType == request.ChangeType);
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and ordering
        var result = await query
            .OrderByDescending(x => x.ChangeDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new LeaveBalanceHistoryViewModel
            {
                Id = x.Id,
                LeaveRequestId = x.LeaveRequestId,
                EmployeeId = x.EmployeeId,
                EmployeeNumber = x.EmployeeNumber,
                EmployeeName = string.Empty, // LeaveBalanceHistory doesn't store EmployeeName, can be populated separately if needed
                LeaveType = x.LeaveType,
                PreviousBalance = x.PreviousBalance,
                NewBalance = x.NewBalance,
                ChangeAmount = x.ChangeAmount,
                ChangeReason = x.ChangeReason,
                ChangedByUserId = x.ChangedByUserId,
                ChangedByUserName = x.ChangedByUser != null ? x.ChangedByUser.FullName : null,
                ChangeDate = x.ChangeDate,
                ChangeType = x.ChangeType,
                CreateAt = x.CreateAt
            })
            .ToListAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<LeaveBalanceHistoryViewModel>>(null!);

        // Set enum display names
        result.ForEach(x => x.LeaveTypeName = x.LeaveType.GetDisplayName());

        var pagedResult = new PagedResult<LeaveBalanceHistoryViewModel>
        {
            Items = result,
            TotalCount = totalCount
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}

