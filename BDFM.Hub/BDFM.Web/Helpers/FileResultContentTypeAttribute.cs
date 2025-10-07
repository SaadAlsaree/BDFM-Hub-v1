namespace BDFM.Web.Helpers;

public class FileResultContentTypeAttribute : Attribute
{
    public FileResultContentTypeAttribute(string contentType)
    {
        ContentType = contentType;
    }

    /// <summary>
    /// Content type of the file e.g. image/png
    /// </summary>
    public string ContentType { get; }
}