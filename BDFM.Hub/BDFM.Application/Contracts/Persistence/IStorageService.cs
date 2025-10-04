namespace BDFM.Application.Contracts.Persistence;
public interface IStorageService
{
    (byte[], byte[]) UploadFileAsync(byte[] binaryFile, string fileName, string bucketName);
    byte[] DownloadFile(string fileName, string bucketName, byte[] _key, byte[] _iv);
}
