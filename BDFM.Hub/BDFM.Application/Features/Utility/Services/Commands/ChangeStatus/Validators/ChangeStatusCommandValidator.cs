using BDFM.Application.Features.Utility.Services.Commands.ChangeStatus;
using BDFM.Domain.Enums;
using FluentValidation;

namespace BDFM.Application.Features.Utility.Services.Commands.ChangeStatus.Validators
{
    public class ChangeStatusCommandValidator<TId> : AbstractValidator<ChangeStatusCommand<TId>>
    {
        private static readonly HashSet<TableNames> ValidTableNamesForStatusChange = new()
        {
            TableNames.Attachments,
            TableNames.Correspondences,
            TableNames.ExternalEntities,
            TableNames.MailFiles,
            TableNames.OrganizationalUnits,
            TableNames.Users,
            TableNames.WorkflowSteps,
            TableNames.Tags,
            TableNames.Roles,
            TableNames.Permissions,
            TableNames.Notifications,
            TableNames.CorrespondenceTemplates,
            TableNames.CustomWorkflows,
            TableNames.CustomWorkflowSteps,
            TableNames.LeaveRequests
        };

        public ChangeStatusCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("ID is required");

            RuleFor(x => x.StatusId)
                .NotEmpty()
                .WithMessage("Status ID is required");

            RuleFor(x => x.TableName)
                .IsInEnum()
                .WithMessage("Invalid table name")
                .Must(BeValidTableNameForStatusChange)
                .WithMessage("Status changes are not allowed for this table");
        }

        private static bool BeValidTableNameForStatusChange(TableNames tableName)
        {
            return ValidTableNamesForStatusChange.Contains(tableName);
        }
    }
}
