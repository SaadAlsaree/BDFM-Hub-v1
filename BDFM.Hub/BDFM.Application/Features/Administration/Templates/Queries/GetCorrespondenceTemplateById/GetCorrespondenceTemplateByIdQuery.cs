namespace BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateById;

public class GetCorrespondenceTemplateByIdQuery : IRequest<Response<CorrespondenceTemplateViewModel>>
{
    public Guid Id { get; set; }
}
