namespace BDFM.Application.Helper
{
    /// <summary>
    /// Interface for generating unique file numbers
    /// </summary>
    public interface IFileNumberGenerator
    {
        /// <summary>
        /// Generates a unique file number in the format "FN-YYYY-00001"
        /// </summary>
        /// <returns>A unique file number</returns>
        string GetUniqueFileNumber();
    }
}
