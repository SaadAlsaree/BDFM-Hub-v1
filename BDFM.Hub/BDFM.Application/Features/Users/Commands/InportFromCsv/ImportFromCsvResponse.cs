namespace BDFM.Application.Features.Users.Commands.InportFromCsv;

public class ImportFromCsvResponse
{
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<string> Errors { get; set; } = new();
}
