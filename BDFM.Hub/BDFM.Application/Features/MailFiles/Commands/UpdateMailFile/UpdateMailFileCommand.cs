namespace BDFM.Application.Features.MailFiles.Commands.UpdateMailFile;

public class UpdateMailFileCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid Id { get; set; }


    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Subject { get; set; }
}
