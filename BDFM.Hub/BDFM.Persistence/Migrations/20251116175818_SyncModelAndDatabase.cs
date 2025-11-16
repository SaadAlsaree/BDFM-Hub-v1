using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelAndDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeaveBalances");

            migrationBuilder.DropTable(
                name: "LeaveRecipientActionLogs");

            migrationBuilder.DropTable(
                name: "LeaveWorkflowStepInteractions");

            migrationBuilder.DropTable(
                name: "LeaveWorkflowStepTemplates");

            migrationBuilder.DropTable(
                name: "LeaveWorkflowSteps");

            migrationBuilder.DropTable(
                name: "LeaveWorkflows");

            migrationBuilder.AlterColumn<Guid>(
                name: "CorrespondenceId",
                table: "WorkflowSteps",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "LeaveRequestId",
                table: "WorkflowSteps",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AvailableBalance",
                table: "LeaveRequests",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMonthlyResetDate",
                table: "LeaveRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyBalance",
                table: "LeaveRequests",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyUsedBalance",
                table: "LeaveRequests",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalBalance",
                table: "LeaveRequests",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "UsedBalance",
                table: "LeaveRequests",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_LeaveRequestId",
                table: "WorkflowSteps",
                column: "LeaveRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowSteps_LeaveRequests_LeaveRequestId",
                table: "WorkflowSteps",
                column: "LeaveRequestId",
                principalTable: "LeaveRequests",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowSteps_LeaveRequests_LeaveRequestId",
                table: "WorkflowSteps");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowSteps_LeaveRequestId",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "LeaveRequestId",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "AvailableBalance",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "LastMonthlyResetDate",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "MonthlyBalance",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "MonthlyUsedBalance",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "TotalBalance",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "UsedBalance",
                table: "LeaveRequests");

            migrationBuilder.AlterColumn<Guid>(
                name: "CorrespondenceId",
                table: "WorkflowSteps",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "LeaveBalances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    AvailableBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmployeeName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EmployeeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    LastMonthlyResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaveType = table.Column<int>(type: "integer", nullable: false),
                    MonthlyBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyUsedBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    TotalBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UsedBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveBalances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveBalances_OrganizationalUnits_OrganizationalUnitId",
                        column: x => x.OrganizationalUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LeaveWorkflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggeringUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    TriggeringLeaveType = table.Column<int>(type: "integer", nullable: true),
                    WorkflowName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflows_OrganizationalUnits_TriggeringUnitId",
                        column: x => x.TriggeringUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LeaveWorkflowSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FromUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    FromUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaveRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InstructionText = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsTimeSensitive = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    ToPrimaryRecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToPrimaryRecipientType = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveWorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflowSteps_LeaveRequests_LeaveRequestId",
                        column: x => x.LeaveRequestId,
                        principalTable: "LeaveRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflowSteps_OrganizationalUnits_FromUnitId",
                        column: x => x.FromUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflowSteps_Users_FromUserId",
                        column: x => x.FromUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveWorkflowStepTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaveWorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DefaultDueDateOffsetDays = table.Column<int>(type: "integer", nullable: true),
                    DefaultInstructionText = table.Column<string>(type: "text", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    TargetIdentifier = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TargetType = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveWorkflowStepTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflowStepTemplates_LeaveWorkflows_LeaveWorkflowId",
                        column: x => x.LeaveWorkflowId,
                        principalTable: "LeaveWorkflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveRecipientActionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionTakenByUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActionTakenByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaveWorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ActionTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InternalActionType = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRecipientActionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveRecipientActionLogs_LeaveWorkflowSteps_LeaveWorkflowSt~",
                        column: x => x.LeaveWorkflowStepId,
                        principalTable: "LeaveWorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveRecipientActionLogs_OrganizationalUnits_ActionTakenByU~",
                        column: x => x.ActionTakenByUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRecipientActionLogs_Users_ActionTakenByUserId",
                        column: x => x.ActionTakenByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveWorkflowStepInteractions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InteractingUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaveWorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveWorkflowStepInteractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflowStepInteractions_LeaveWorkflowSteps_LeaveWorkf~",
                        column: x => x.LeaveWorkflowStepId,
                        principalTable: "LeaveWorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveWorkflowStepInteractions_Users_InteractingUserId",
                        column: x => x.InteractingUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_EmployeeId",
                table: "LeaveBalances",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_EmployeeId_LeaveType",
                table: "LeaveBalances",
                columns: new[] { "EmployeeId", "LeaveType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_IsDeleted",
                table: "LeaveBalances",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_LeaveType",
                table: "LeaveBalances",
                column: "LeaveType");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_OrganizationalUnitId",
                table: "LeaveBalances",
                column: "OrganizationalUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_StatusId",
                table: "LeaveBalances",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecipientActionLogs_ActionTakenByUnitId",
                table: "LeaveRecipientActionLogs",
                column: "ActionTakenByUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecipientActionLogs_ActionTakenByUserId",
                table: "LeaveRecipientActionLogs",
                column: "ActionTakenByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecipientActionLogs_ActionTimestamp",
                table: "LeaveRecipientActionLogs",
                column: "ActionTimestamp");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecipientActionLogs_IsDeleted",
                table: "LeaveRecipientActionLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecipientActionLogs_LeaveWorkflowStepId",
                table: "LeaveRecipientActionLogs",
                column: "LeaveWorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecipientActionLogs_StatusId",
                table: "LeaveRecipientActionLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_IsDeleted",
                table: "LeaveWorkflows",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_IsEnabled",
                table: "LeaveWorkflows",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_StatusId",
                table: "LeaveWorkflows",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_TriggeringLeaveType",
                table: "LeaveWorkflows",
                column: "TriggeringLeaveType");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_TriggeringUnitId",
                table: "LeaveWorkflows",
                column: "TriggeringUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_WorkflowName",
                table: "LeaveWorkflows",
                column: "WorkflowName");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflows_WorkflowName_TriggeringUnitId",
                table: "LeaveWorkflows",
                columns: new[] { "WorkflowName", "TriggeringUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepInteractions_InteractingUserId",
                table: "LeaveWorkflowStepInteractions",
                column: "InteractingUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepInteractions_IsDeleted",
                table: "LeaveWorkflowStepInteractions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepInteractions_LeaveWorkflowStepId",
                table: "LeaveWorkflowStepInteractions",
                column: "LeaveWorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepInteractions_LeaveWorkflowStepId_Interacti~",
                table: "LeaveWorkflowStepInteractions",
                columns: new[] { "LeaveWorkflowStepId", "InteractingUserId" },
                unique: true,
                filter: "\"InteractingUserId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepInteractions_StatusId",
                table: "LeaveWorkflowStepInteractions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_FromUnitId",
                table: "LeaveWorkflowSteps",
                column: "FromUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_FromUserId",
                table: "LeaveWorkflowSteps",
                column: "FromUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_IsDeleted",
                table: "LeaveWorkflowSteps",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_LeaveRequestId",
                table: "LeaveWorkflowSteps",
                column: "LeaveRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_LeaveRequestId_Status",
                table: "LeaveWorkflowSteps",
                columns: new[] { "LeaveRequestId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_Status",
                table: "LeaveWorkflowSteps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_StatusId",
                table: "LeaveWorkflowSteps",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_ToPrimaryRecipientId",
                table: "LeaveWorkflowSteps",
                column: "ToPrimaryRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowSteps_ToPrimaryRecipientId_ToPrimaryRecipientT~",
                table: "LeaveWorkflowSteps",
                columns: new[] { "ToPrimaryRecipientId", "ToPrimaryRecipientType", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepTemplates_IsDeleted",
                table: "LeaveWorkflowStepTemplates",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepTemplates_LeaveWorkflowId",
                table: "LeaveWorkflowStepTemplates",
                column: "LeaveWorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepTemplates_LeaveWorkflowId_StepOrder",
                table: "LeaveWorkflowStepTemplates",
                columns: new[] { "LeaveWorkflowId", "StepOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveWorkflowStepTemplates_StatusId",
                table: "LeaveWorkflowStepTemplates",
                column: "StatusId");
        }
    }
}
