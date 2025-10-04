using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Tags.Commands.UpdateTag
{
    public class UpdateTagCommandHandler : UpdateHandler<Tag, UpdateTagCommand>, IRequestHandler<UpdateTagCommand, Response<bool>>
    {
        public UpdateTagCommandHandler(IBaseRepository<Tag> repository) : base(repository)
        {
        }
        public override Expression<Func<Tag, bool>> EntityPredicate(UpdateTagCommand request)
        {
            return t => t.Id == request.Id && !t.IsDeleted;
        }

        public async Task<Response<bool>> Handle(UpdateTagCommand request, CancellationToken cancellationToken)
        {
            return await HandleBase(request, cancellationToken);
        }


    }
}
