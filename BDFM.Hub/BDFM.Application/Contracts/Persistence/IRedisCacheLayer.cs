namespace BDFM.Application.Contracts.Persistence;


public interface IRedisCacheLayer : IDisposable
{
    bool TryGet(string key, out RedisValue value);

    IEnumerable<RedisValue> GetPerKey(string key, int count);
    bool SetItem(string key, string value, TimeSpan timeSpan);
    bool DeleteItem(string key);
    void AppendItemsToKey(string key, string value);
}
