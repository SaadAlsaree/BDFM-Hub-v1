using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Administration.ExternalEntities.Commands.CreateExternalEntity;

public class CreateExternalEntityCommandHandler : CreateHandler<ExternalEntity, CreateExternalEntityCommand>, IRequestHandler<CreateExternalEntityCommand, Response<bool>>
{
    public CreateExternalEntityCommandHandler(IBaseRepository<ExternalEntity> repository)
        : base(repository)
    {
    }

    protected override Expression<Func<ExternalEntity, bool>> ExistencePredicate(CreateExternalEntityCommand request)
    {
        return entity => entity.EntityCode == request.EntityCode && !entity.IsDeleted;
    }

    protected override ExternalEntity MapToEntity(CreateExternalEntityCommand request)
    {
        return new ExternalEntity
        {
            Id = Guid.NewGuid(),
            EntityName = request.EntityName,
            EntityCode = request.EntityCode,
            EntityType = request.EntityType,
            ContactInfo = request.ContactInfo
        };
    }

    public async Task<Response<bool>> Handle(CreateExternalEntityCommand request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
