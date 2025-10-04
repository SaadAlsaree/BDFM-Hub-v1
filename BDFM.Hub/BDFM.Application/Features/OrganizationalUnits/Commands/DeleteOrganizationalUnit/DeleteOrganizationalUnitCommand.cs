using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

namespace BDFM.Application.Features.OrganizationalUnits.Commands.DeleteOrganizationalUnit;

public class DeleteOrganizationalUnitCommand : DeleteRecordCommand<Guid>
{
    public DeleteOrganizationalUnitCommand()
    {
        TableName = TableNames.OrganizationalUnits;
    }
}
