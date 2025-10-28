using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Administration.Templates.Commands.CreateCorrespondenceTemplate;

public class CreateCorrespondenceTemplateCommandHandler : CreateHandler<CorrespondenceTemplate, CreateCorrespondenceTemplateCommand>,
    IRequestHandler<CreateCorrespondenceTemplateCommand, Response<bool>>
{


    public CreateCorrespondenceTemplateCommandHandler(IBaseRepository<CorrespondenceTemplate> repository)
        : base(repository)
    {

    }

    protected override Expression<Func<CorrespondenceTemplate, bool>> ExistencePredicate(CreateCorrespondenceTemplateCommand request)
    {
        // ?????? ?????? ???????? - ?? ???? ??? ??? ???????
      return entity => false;
  }

    protected override CorrespondenceTemplate MapToEntity(CreateCorrespondenceTemplateCommand request)
    {

        return new CorrespondenceTemplate
        {
            Id = Guid.NewGuid(),
            TemplateName = request.TemplateName,
            Subject = request.Subject,
            OrganizationalUnitId = request.OrganizationalUnitId,
            BodyText = request.BodyText,
            CreateBy = request.CreateBy
        };
    }

    public async Task<Response<bool>> Handle(CreateCorrespondenceTemplateCommand request, CancellationToken cancellationToken)
    {




        return await HandleBase(request, cancellationToken);
    }
}
