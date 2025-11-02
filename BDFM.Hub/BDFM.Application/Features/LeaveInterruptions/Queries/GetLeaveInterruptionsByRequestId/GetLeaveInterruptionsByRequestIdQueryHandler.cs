using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveInterruptions.Queries.GetLeaveInterruptionsByRequestId;

public class GetLeaveInterruptionsByRequestIdQueryHandler : IRequestHandler<GetLeaveInterruptionsByRequestIdQuery, Response<List<LeaveInterruptionViewModel>>>
{
    private readonly IBaseRepository<LeaveInterruption> _repository;

    public GetLeaveInterruptionsByRequestIdQueryHandler(IBaseRepository<LeaveInterruption> repository)
    {
        _repository = repository;
    }

    public async Task<Response<List<LeaveInterruptionViewModel>>> Handle(GetLeaveInterruptionsByRequestIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _repository.Query()
            .Where(x => !x.IsDeleted && x.LeaveRequestId == request.LeaveRequestId)
            .Include(x => x.InterruptedByUser)
            .Include(x => x.LeaveRequest)
            .OrderByDescending(x => x.InterruptionDate)
            .Select(x => new LeaveInterruptionViewModel
            {
                Id = x.Id,
                LeaveRequestId = x.LeaveRequestId,
                InterruptionDate = x.InterruptionDate,
                ReturnDate = x.ReturnDate,
                InterruptionType = x.InterruptionType,
                Reason = x.Reason,
                InterruptedByUserId = x.InterruptedByUserId,
                InterruptedByUserName = x.InterruptedByUser != null ? x.InterruptedByUser.FullName : null,
                EmployeeId = x.LeaveRequest != null ? x.LeaveRequest.EmployeeId : null,
                IsProcessed = x.IsProcessed,
                AdjustedDays = x.AdjustedDays,
                CreateAt = x.CreateAt
            })
            .ToListAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<LeaveInterruptionViewModel>>(null!);

        // Set enum display names
        result.ForEach(x => x.InterruptionTypeName = x.InterruptionType.GetDisplayName());

        return SuccessMessage.Get.ToSuccessMessage(result);
    }
}

