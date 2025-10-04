using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.AuditLogs.Queries.GetAuditLogById;

public class GetAuditLogByIdQueryHandler :
    GetByIdHandler<AuditLog, AuditLogViewModel, GetAuditLogByIdQuery>,
    IRequestHandler<GetAuditLogByIdQuery, Response<AuditLogViewModel>>
{
    public GetAuditLogByIdQueryHandler(IBaseRepository<AuditLog> repository)
        : base(repository)
    {
    }

    public override Expression<Func<AuditLog, bool>> IdPredicate(GetAuditLogByIdQuery request)
    {
        return log => log.Id == request.Id;
    }

    public override Expression<Func<AuditLog, AuditLogViewModel>> Selector => log => new AuditLogViewModel
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

    public async Task<Response<AuditLogViewModel>> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query(IdPredicate(request));

        // Include User relationship
        query = query.Include(log => log.User);

        // Get the result
        var result = await query
            .Select(Selector)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<AuditLogViewModel>(null!);

        return SuccessMessage.Get.ToSuccessMessage(result);
    }
}
