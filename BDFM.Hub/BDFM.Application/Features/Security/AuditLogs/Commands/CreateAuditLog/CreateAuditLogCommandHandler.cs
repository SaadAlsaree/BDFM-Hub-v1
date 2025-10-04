using BDFM.Application.Services;
using BDFM.Domain.Entities.Security;
using MediatR;
using BDFM.Domain.Common;

namespace BDFM.Application.Features.Security.AuditLogs.Commands.CreateAuditLog;

public class CreateAuditLogCommandHandler : IRequestHandler<CreateAuditLogCommand, Response<AuditLog>>
{
    private readonly IAuditTrailService _auditTrailService;

    public CreateAuditLogCommandHandler(IAuditTrailService auditTrailService)
    {
        _auditTrailService = auditTrailService;
    }

    public async Task<Response<AuditLog>> Handle(CreateAuditLogCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var auditLog = await _auditTrailService.CreateAuditLogAsync(
                request.Action,
                request.AffectedEntity,
                request.AffectedEntityId,
                request.UserId,
                request.Details,
                request.IpAddress);

            return Response<AuditLog>.Success(auditLog);
        }
        catch (Exception ex)
        {
            return Response<AuditLog>.Fail(new MessageResponse { Message = $"خطأ في إنشاء سجل الإجراء: {ex.Message}" });
        }
    }
}