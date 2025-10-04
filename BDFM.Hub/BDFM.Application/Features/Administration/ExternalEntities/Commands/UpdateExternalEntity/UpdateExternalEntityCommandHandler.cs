using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Administration.ExternalEntities.Commands.UpdateExternalEntity;

public class UpdateExternalEntityCommandHandler : UpdateHandler<ExternalEntity, UpdateExternalEntityCommand>, IRequestHandler<UpdateExternalEntityCommand, Response<bool>>
{
    public UpdateExternalEntityCommandHandler(IBaseRepository<ExternalEntity> repository)
        : base(repository)
    {
    }

    public override Expression<Func<ExternalEntity, bool>> EntityPredicate(UpdateExternalEntityCommand request)
    {
        return x => x.Id == request.Id && !x.IsDeleted;
    }

    public async Task<Response<bool>> Handle(UpdateExternalEntityCommand request, CancellationToken cancellationToken)
    {

        return await HandleBase(request, cancellationToken);
    }
}
