namespace BDFM.Application.Features.MailFiles.Commands.CreateMailFile;

public class CreateMailFileCommand : IRequest<Response<bool>>
{

    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Subject { get; set; }
}
