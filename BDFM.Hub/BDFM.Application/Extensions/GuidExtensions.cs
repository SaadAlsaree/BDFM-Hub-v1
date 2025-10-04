namespace BDFM.Application.Extensions;
public static class GuidExtensions
{
    public static string StringFormat(this Guid id) =>
        id.ToString()[..8].ToUpper();
}
