using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.MailFiles.Commands.UpdateMailFile;

public class UpdateMailFileCommandHandler :
    UpdateHandler<MailFile, UpdateMailFileCommand>,
    IRequestHandler<UpdateMailFileCommand, Response<bool>>
{
    public UpdateMailFileCommandHandler(IBaseRepository<MailFile> repository) : base(repository)
    {
    }

    public override Expression<Func<MailFile, bool>> EntityPredicate(UpdateMailFileCommand request)
    {
        return mf => mf.Id == request.Id;
    }

    public async Task<Response<bool>> Handle(UpdateMailFileCommand request, CancellationToken cancellationToken)
    {

        return await HandleBase(request, cancellationToken);
    }
}
