namespace BDFM.Application.Features.Security.Delegations.Queries.GetDelegationById;

public class GetDelegationByIdQuery : IRequest<Response<DelegationViewModel>>
{
    public Guid Id { get; set; }
}
