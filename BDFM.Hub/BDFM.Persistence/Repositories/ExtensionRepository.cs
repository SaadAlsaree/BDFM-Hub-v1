
using BDFM.Application.Contracts;
using BDFM.Application.Features.Utility.Services.Commands.ChangeStatus;
using BDFM.Domain.Enums;

namespace BDFM.Persistence.Repositories;
public class ExtensionRepository<TId> : IDisposable, IExtensionRepository<TId>
{
    public BDFMDbContext DbContext;

    public ExtensionRepository(BDFMDbContext context)
    {
        DbContext = context;
    }
    public async Task<bool> ChangeStatusRecordAsync(ChangeStatusCommand<TId> command)
    {
        var query = $"update \"{command.TableName}\" set \"StatusId\" = @p0 , \"LastUpdateAt\" = now() where \"Id\" = @p1;";
        if (command.StatusId == Status.ActionTaken)
        {
            query = $"update \"{command.TableName}\" set \"StatusId\" = @p0 , \"DoneProcdureDate\" = now(), \"LastUpdateAt\" = now() where \"Id\" = @p1;";


            var queryOrder = $"WITH existing_record AS (SELECT \"Id\" FROM \"CompletedOrders\" WHERE EXTRACT(MONTH FROM \"OnDate\") = EXTRACT(MONTH FROM CURRENT_DATE) " +
                $"AND EXTRACT(YEAR FROM \"OnDate\") = EXTRACT(YEAR FROM CURRENT_DATE) AND \"TeamId\" = '{command.TeamId}' LIMIT 1), updated AS (UPDATE \"CompletedOrders\" SET \"CountOfOrders\" = \"CountOfOrders\" + 1" +
                $" WHERE \"Id\" = (SELECT \"Id\" FROM existing_record) RETURNING \"Id\") INSERT INTO \"CompletedOrders\" (\"Id\", \"TeamId\", \"TeamName\", \"OnDate\", \"CountOfOrders\",\"CreateAt\",\"IsDeleted\",\"StatusId\") " +
                $"SELECT '{Guid.NewGuid()}','{command.TeamId}','{command.TeamName}', to_char(CURRENT_DATE, 'YYYY-MM-01')::date, 1,current_timestamp,false,0 WHERE NOT EXISTS (SELECT 1 FROM updated);";

            _ = await DbContext.Database.ExecuteSqlRawAsync(queryOrder) > 0;
        }
        return await DbContext.Database.ExecuteSqlRawAsync(query, command.StatusId, command.Id!) > 0;

    }

    public async Task<bool> DeleteRecordAsync(string tableName, TId primaryId)
    {
        var query = $"update \"{tableName}\" set \"IsDeleted\" = false , \"DeletedAt\" = now() where \"Id\" = '@p0';";
        return await DbContext.Database.ExecuteSqlRawAsync(query, tableName, primaryId!) > 0;
    }

    #region IDisposable Support
    private bool _disposedValue;

    protected virtual void Dispose(bool disposing)
    {
        if (_disposedValue) return;
        if (disposing)
        {
        }
        _disposedValue = true;
    }

    ~ExtensionRepository()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    public void Dispose()
    {
        Dispose(true);
        DbContext.Dispose();
        GC.SuppressFinalize(this);
    }
    #endregion
}