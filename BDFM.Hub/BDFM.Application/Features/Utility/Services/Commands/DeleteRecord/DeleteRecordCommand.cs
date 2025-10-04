namespace BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

public class DeleteRecordCommand<TId> : IRequest<Response<bool>>
{
    public TId Id { get; set; } = default!;
    public TableNames TableName { get; set; }
}
