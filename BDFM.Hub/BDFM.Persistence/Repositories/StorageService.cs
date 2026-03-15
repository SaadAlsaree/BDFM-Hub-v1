

namespace BDFM.Persistence.Repositories;
public class StorageService : IStorageService
{
    private byte[] Key = default!;
    private byte[] IV = default!;

    private readonly string _host;
    private readonly string _username;
    private readonly string _password;
    private readonly int _port;
    private readonly int _op;

    public StorageService(IConfiguration configuration)
    {
        Key = GenerateAESKey();
        IV = GenerateAESIv();
        _host = configuration.GetValue<string>("FTP:Host")!;
        _username = configuration.GetValue<string>("FTP:Username")!;
        _password = configuration.GetValue<string>("FTP:Password")!;
        _port = configuration.GetValue<int>("FTP:Port");
        _op = configuration.GetValue<int>("FTP:OP");
    }

    public (byte[], byte[]) UploadFileAsync(byte[] binaryFile, string fileName, string bucketName)
    {

        using var client = new FtpClient(_host, _username, _password, _port, new FtpConfig()
        {
            DataConnectionConnectTimeout = 5000,
            ReadTimeout = 5000,
            ConnectTimeout = 5000,
            RetryAttempts = 3,
            DataConnectionType = _op == 1 ? FtpDataConnectionType.AutoActive : FtpDataConnectionType.PASV,
            LogToConsole = true,
        });

        client.Connect(true);
        if (!client.IsAuthenticated)
            return (null!, null!);
        if (!client.IsConnected)
            return (null!, null!);
        if (!client.DirectoryExists(bucketName))
        {
            client.CreateDirectory(bucketName);
        }
        var encryptedContents = Encrypt(binaryFile);
        var status = client.UploadBytes(encryptedContents, $"{bucketName}/{fileName}");
        if (status != FtpStatus.Success)
        {

        }
        client.AutoDispose();
        return (Key, IV);
    }

    public byte[] DownloadFile(string fileName, string bucketName, byte[] _key, byte[] _iv)
    {
        using var client = new FtpClient(_host, _username, _password, port: _port, new FtpConfig()
        {
            DataConnectionConnectTimeout = 5000,
            ReadTimeout = 5000,
            ConnectTimeout = 5000,
            RetryAttempts = 3,
            DataConnectionType = _op == 1 ? FtpDataConnectionType.AutoActive : FtpDataConnectionType.PASV,
            LogToConsole = true,
        });
        client.Connect();
        if (!client.IsAuthenticated)
            return null!;
        if (!client.IsConnected)
            return null!;
        if (!client.DirectoryExists(bucketName))
            return null!;
        client.DownloadBytes(out var byteFile, $"{bucketName}/{fileName}");
        if (!_key.Any())
            return byteFile;
        return Decrypt(byteFile, _key, _iv);
    }

    public static byte[] GenerateAESKey(int keySize = 256)
    {
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] key = new byte[keySize / 8]; // Convert bit size to byte size.
            rng.GetBytes(key);
            return key;
        }
    }

    public static byte[] GenerateAESIv()
    {
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] iv = new byte[16]; // 128 bits for IV.
            rng.GetBytes(iv);
            return iv;
        }
    }
    public byte[] Encrypt(byte[] data)
    {
        using (var aes = Aes.Create())
        {
            aes.Key = Key;
            aes.IV = IV;

            using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
            {
                using (var ms = new MemoryStream())
                {
                    using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                    {
                        cs.Write(data, 0, data.Length);
                    }

                    return ms.ToArray();
                }
            }
        }
    }

    public static byte[] Decrypt(byte[] encryptedData, byte[] _key, byte[] _iv)
    {
        using (var aes = Aes.Create())
        {
            aes.Key = _key;
            aes.IV = _iv;

            using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
            {
                using (var ms = new MemoryStream())
                {
                    using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Write))
                    {
                        cs.Write(encryptedData, 0, encryptedData.Length);
                    }

                    return ms.ToArray();
                }
            }
        }
    }
}