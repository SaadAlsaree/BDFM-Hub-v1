using Swashbuckle.AspNetCore.Annotations;

namespace BDFM.Application.Features.Utility.Services.Commands.ChangeStatus;

public class ChangeStatusCommand<TId> : IRequest<Response<bool>>
{

    public TId Id { get; set; } = default!;
    public Status StatusId { get; set; }
    [SwaggerSchema(ReadOnly = true)]
    public TableNames TableName { get; set; }
    [SwaggerSchema(ReadOnly = true)]
    public Guid? TeamId { get; set; } = Guid.Empty;
    [SwaggerSchema(ReadOnly = true)]
    public string TeamName { get; set; } = string.Empty;
}
