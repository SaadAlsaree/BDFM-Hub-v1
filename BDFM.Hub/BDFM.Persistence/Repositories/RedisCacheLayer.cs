using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace BDFM.Persistence.Repositories;

public class RedisCacheLayer : IRedisCacheLayer
{
    private readonly ConnectionMultiplexer redis;

    private readonly RedisCacheConnectionString _redisCacheConnectionString;

    private readonly IDatabase db;
    public RedisCacheLayer(IOptions<RedisCacheConnectionString> redisCacheConnectionString)
    {
        _redisCacheConnectionString = redisCacheConnectionString.Value;
        if (string.IsNullOrEmpty(_redisCacheConnectionString.ConnectionString))
            throw new Exception("حدث خطا أثناء بالأتصال رمز الخطا #313_201");

        redis = ConnectionMultiplexer.Connect(_redisCacheConnectionString.ConnectionString);

        db = redis.GetDatabase();

    }
    public bool TryGet(string key, out RedisValue value)
    {
        try
        {
            value = db.KeyExists(key) == true ? db.StringGet(key) : RedisValue.EmptyString;
            return db.KeyExists(key);
        }
        catch (Exception)
        {
            value = RedisValue.EmptyString;
            return false;
        }
    }
    public bool SetItem(string key, string value, TimeSpan timeSpan)
    {
        return db.StringSet(key, value, timeSpan);
    }
    public bool DeleteItem(string key)
    {
        var t = db.KeyDelete(key);
        return t;
    }
    public void AppendItemsToKey(string key, string value)
    {
        db.StringAppend(key, value);
    }
    public IEnumerable<RedisValue> GetPerKey(string key, int count)
    {
        try
        {
            List<RedisValue> list = new();
            IServer server = redis.GetServer(_redisCacheConnectionString.ConnectionString);
            foreach (var redisKey in server.Keys(0, key, count))
            {
                list.Add(key);
            }
            return list;
        }
        catch (Exception)
        {
            return null!;
        }
    }
    #region IDisposable Support
    private bool disposedValue = false;

    protected virtual void Dispose(bool disposing)
    {
        if (!disposedValue)
        {
            if (disposing)
            {
                redis.Close();
                redis.Dispose();
            }
            disposedValue = true;
        }
    }

    ~RedisCacheLayer()
    {
        Dispose(true);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }


    #endregion

}

public class RedisCacheConnectionString
{
    public string ConnectionString { get; set; } = string.Empty;
}