using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

namespace BDFM.Application.Features.Security.Delegations.Commands.DeleteDelegation;

public class DeleteDelegationCommand : DeleteRecordCommand<Guid>
{
    public DeleteDelegationCommand()
    {
        TableName = TableNames.Delegations;
    }
}
