namespace BDFM.Application.Helper;

public interface IMailNumberGenerator
{
    /// <summary>
    /// Generates a unique Mail number in the format "YYYY-1"
    /// </summary>
    /// <returns>A unique Mail number</returns>
    string GetUniqueMailNumber();
}
