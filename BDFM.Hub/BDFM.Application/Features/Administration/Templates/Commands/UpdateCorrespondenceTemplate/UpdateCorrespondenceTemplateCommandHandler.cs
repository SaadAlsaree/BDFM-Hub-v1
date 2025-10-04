using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Administration.Templates.Commands.UpdateCorrespondenceTemplate;

public class UpdateCorrespondenceTemplateCommandHandler : UpdateHandler<CorrespondenceTemplate, UpdateCorrespondenceTemplateCommand>,
    IRequestHandler<UpdateCorrespondenceTemplateCommand, Response<bool>>
{
    public UpdateCorrespondenceTemplateCommandHandler(IBaseRepository<CorrespondenceTemplate> repository)
        : base(repository)
    {
    }

    public override Expression<Func<CorrespondenceTemplate, bool>> EntityPredicate(UpdateCorrespondenceTemplateCommand request)
    {
        return x => x.Id == request.Id && !x.IsDeleted;
    }

    public async Task<Response<bool>> Handle(UpdateCorrespondenceTemplateCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate template by TemplateName and Subject (exclude current entity)
        var duplicateCheck = await _repository.Find(
            x => x.TemplateName == request.TemplateName &&
                 x.Subject == request.Subject &&
                 x.Id != request.Id &&
                 !x.IsDeleted,
            cancellationToken: cancellationToken);

        if (duplicateCheck != null)
            return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);

        return await HandleBase(request, cancellationToken);
    }
}
