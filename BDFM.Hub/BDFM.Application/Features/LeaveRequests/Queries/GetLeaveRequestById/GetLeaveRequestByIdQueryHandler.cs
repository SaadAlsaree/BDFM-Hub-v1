using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveRequests.Queries.GetLeaveRequestById;

public class GetLeaveRequestByIdQueryHandler : GetByIdHandler<LeaveRequest, LeaveRequestViewModel, GetLeaveRequestByIdQuery>,
    IRequestHandler<GetLeaveRequestByIdQuery, Response<LeaveRequestViewModel>>
{
    public GetLeaveRequestByIdQueryHandler(IBaseRepository<LeaveRequest> repository)
        : base(repository)
    {
    }

    public override Expression<Func<LeaveRequest, bool>> IdPredicate(GetLeaveRequestByIdQuery request)
    {
        return entity => entity.Id == request.Id && !entity.IsDeleted;
    }

    public override Expression<Func<LeaveRequest, LeaveRequestViewModel>> Selector => entity => new LeaveRequestViewModel
    {
        Id = entity.Id,
        EmployeeId = entity.EmployeeId,
        EmployeeNumber = entity.EmployeeNumber,
        EmployeeName = entity.EmployeeName,
        OrganizationalUnitId = entity.OrganizationalUnitId,
        OrganizationalUnitName = entity.OrganizationalUnit != null ? entity.OrganizationalUnit.UnitName : null,
        CreatedByUserId = entity.CreatedByUserId,
        CreatedByUserName = entity.CreatedByUser != null ? entity.CreatedByUser.FullName : null,
        LeaveType = entity.LeaveType,
        StartDate = entity.StartDate,
        EndDate = entity.EndDate,
        RequestedDays = entity.RequestedDays,
        ApprovedDays = entity.ApprovedDays,
        // HR Balance Snapshot
        TotalBalance = entity.TotalBalance,
        MonthlyBalance = entity.MonthlyBalance,
        UsedBalance = entity.UsedBalance,
        AvailableBalance = entity.AvailableBalance,
        MonthlyUsedBalance = entity.MonthlyUsedBalance,
        LastMonthlyResetDate = entity.LastMonthlyResetDate,
        Status = entity.Status,
        Reason = entity.Reason,
        RejectionReason = entity.RejectionReason,
        ApprovedAt = entity.ApprovedAt,
        ApprovedByUserId = entity.ApprovedByUserId,
        ApprovedByUserName = entity.ApprovedByUser != null ? entity.ApprovedByUser.FullName : null,
        CancelledByUserId = entity.CancelledByUserId,
        CancelledByUserName = entity.CancelledByUser != null ? entity.CancelledByUser.FullName : null,
        CancelledAt = entity.CancelledAt,
        CancellationReason = entity.CancellationReason,
        IsInterrupted = entity.IsInterrupted,
        ActualEndDate = entity.ActualEndDate,
        RequestNumber = entity.RequestNumber,
        CreateAt = entity.CreateAt,
        CreateBy = entity.CreateBy,
        LastUpdateAt = entity.LastUpdateAt,
        LastUpdateBy = entity.LastUpdateBy,
        StatusId = (int)entity.StatusId
    };

    public async Task<Response<LeaveRequestViewModel>> Handle(GetLeaveRequestByIdQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query(IdPredicate(request));

        // Include related entities
        query = query
            .Include(lr => lr.OrganizationalUnit)
            .Include(lr => lr.CreatedByUser)
            .Include(lr => lr.ApprovedByUser)
            .Include(lr => lr.CancelledByUser);

        var entity = await query
            .Select(Selector)
            .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (entity == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<LeaveRequestViewModel>(null!);

        // Set enum display names
        entity.LeaveTypeName = entity.LeaveType.GetDisplayName();
        entity.StatusName = entity.Status.GetDisplayName();

        return SuccessMessage.Get.ToSuccessMessage(entity);
    }
}



