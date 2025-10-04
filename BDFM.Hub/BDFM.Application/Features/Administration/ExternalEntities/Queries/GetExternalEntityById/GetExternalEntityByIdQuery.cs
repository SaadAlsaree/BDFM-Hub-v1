namespace BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityById;

public class GetExternalEntityByIdQuery : IRequest<Response<ExternalEntityViewModel>>
{
    public Guid Id { get; set; }
}
