using Microsoft.AspNetCore.Http;

namespace BDFM.Application.Features.Users.Commands.InportFromCsv;

public class ImportFromCsvCommand : IRequest<Response<ImportFromCsvResponse>>
{
    [Required]
    public IFormFile File { get; set; } = null!;
}
