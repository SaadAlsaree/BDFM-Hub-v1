using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;

namespace BDFM.Application.Features.LeaveCancellations.Queries.GetLeaveCancellationsByRequestId;

public class GetLeaveCancellationsByRequestIdQueryHandler : IRequestHandler<GetLeaveCancellationsByRequestIdQuery, Response<List<LeaveCancellationViewModel>>>
{
    private readonly IBaseRepository<LeaveCancellation> _repository;

    public GetLeaveCancellationsByRequestIdQueryHandler(IBaseRepository<LeaveCancellation> repository)
    {
        _repository = repository;
    }

    public async Task<Response<List<LeaveCancellationViewModel>>> Handle(GetLeaveCancellationsByRequestIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _repository.Query()
            .Where(x => !x.IsDeleted && x.LeaveRequestId == request.LeaveRequestId)
            .Include(x => x.CancelledByUser)
            .Include(x => x.LeaveRequest)
            .OrderByDescending(x => x.CancellationDate)
            .Select(x => new LeaveCancellationViewModel
            {
                Id = x.Id,
                LeaveRequestId = x.LeaveRequestId,
                CancellationDate = x.CancellationDate,
                CancelledByUserId = x.CancelledByUserId,
                CancelledByUserName = x.CancelledByUser != null ? x.CancelledByUser.FullName : null,
                EmployeeId = x.LeaveRequest != null ? x.LeaveRequest.EmployeeId : null,
                Reason = x.Reason,
                IsBalanceRestored = x.IsBalanceRestored,
                RestoredDays = x.RestoredDays,
                CreateAt = x.CreateAt
            })
            .ToListAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<List<LeaveCancellationViewModel>>(null!);

        return SuccessMessage.Get.ToSuccessMessage(result);
    }
}

