using BDFM.Application.Features.Utility.Services.Commands.ChangeStatus;

namespace BDFM.Application.Features.Users.Commands.UpdateUserStatus;

public class UpdateUserStatusCommand : ChangeStatusCommand<Guid>
{
    public UpdateUserStatusCommand()
    {
        TableName = TableNames.Users;
    }
}
