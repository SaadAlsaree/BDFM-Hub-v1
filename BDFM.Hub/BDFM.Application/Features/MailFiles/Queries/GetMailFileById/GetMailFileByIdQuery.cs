namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileById;

public class GetMailFileByIdQuery : IRequest<Response<MailFileViewModel>>
{
    public Guid Id { get; set; }
}
