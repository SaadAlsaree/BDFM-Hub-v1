using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

namespace BDFM.Application.Features.Security.Roles.Commands.DeleteRole;

public class DeleteRoleCommand : DeleteRecordCommand<Guid>
{
    public DeleteRoleCommand()
    {
        TableName = TableNames.Roles;
    }
}
