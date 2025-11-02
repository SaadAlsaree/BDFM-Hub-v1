using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LeaveBalances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmployeeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmployeeName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaveType = table.Column<int>(type: "integer", nullable: false),
                    TotalBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UsedBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AvailableBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyUsedBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LastMonthlyResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
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
                name: "LeaveRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmployeeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmployeeName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    LeaveType = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RequestedDays = table.Column<int>(type: "integer", nullable: false),
                    ApprovedDays = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CancelledByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    IsInterrupted = table.Column<bool>(type: "boolean", nullable: false),
                    ActualEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RequestNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_OrganizationalUnits_OrganizationalUnitId",
                        column: x => x.OrganizationalUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Users_CancelledByUserId",
                        column: x => x.CancelledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveWorkflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TriggeringUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggeringLeaveType = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
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
                name: "LeaveBalanceHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaveRequestId = table.Column<Guid>(type: "uuid", nullable: true),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmployeeNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LeaveType = table.Column<int>(type: "integer", nullable: false),
                    PreviousBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    NewBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ChangeAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ChangeReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ChangedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChangeType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveBalanceHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveBalanceHistories_LeaveRequests_LeaveRequestId",
                        column: x => x.LeaveRequestId,
                        principalTable: "LeaveRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LeaveBalanceHistories_Users_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveCancellations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaveRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    CancellationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CancelledByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    IsBalanceRestored = table.Column<bool>(type: "boolean", nullable: false),
                    RestoredDays = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveCancellations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveCancellations_LeaveRequests_LeaveRequestId",
                        column: x => x.LeaveRequestId,
                        principalTable: "LeaveRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveCancellations_Users_CancelledByUserId",
                        column: x => x.CancelledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveInterruptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaveRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    InterruptionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    InterruptionType = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    InterruptedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsProcessed = table.Column<bool>(type: "boolean", nullable: false),
                    AdjustedDays = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveInterruptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveInterruptions_LeaveRequests_LeaveRequestId",
                        column: x => x.LeaveRequestId,
                        principalTable: "LeaveRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveInterruptions_Users_InterruptedByUserId",
                        column: x => x.InterruptedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveWorkflowSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaveRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    FromUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    FromUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    ToPrimaryRecipientType = table.Column<int>(type: "integer", nullable: false),
                    ToPrimaryRecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    InstructionText = table.Column<string>(type: "text", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsTimeSensitive = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
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
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    TargetIdentifier = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    DefaultInstructionText = table.Column<string>(type: "text", nullable: true),
                    DefaultDueDateOffsetDays = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
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
                    LeaveWorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionTakenByUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActionTakenByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActionTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActionDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    InternalActionType = table.Column<int>(type: "integer", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
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
                    LeaveWorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
                    InteractingUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastUpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdateBy = table.Column<Guid>(type: "uuid", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoneProcdureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
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
                name: "IX_LeaveBalanceHistories_ChangeDate",
                table: "LeaveBalanceHistories",
                column: "ChangeDate");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_ChangedByUserId",
                table: "LeaveBalanceHistories",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_ChangeType",
                table: "LeaveBalanceHistories",
                column: "ChangeType");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_EmployeeId",
                table: "LeaveBalanceHistories",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_EmployeeId_LeaveType_ChangeDate",
                table: "LeaveBalanceHistories",
                columns: new[] { "EmployeeId", "LeaveType", "ChangeDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_IsDeleted",
                table: "LeaveBalanceHistories",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_LeaveRequestId",
                table: "LeaveBalanceHistories",
                column: "LeaveRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_LeaveType",
                table: "LeaveBalanceHistories",
                column: "LeaveType");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceHistories_StatusId",
                table: "LeaveBalanceHistories",
                column: "StatusId");

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
                name: "IX_LeaveCancellations_CancelledByUserId",
                table: "LeaveCancellations",
                column: "CancelledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveCancellations_EmployeeId",
                table: "LeaveCancellations",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveCancellations_IsDeleted",
                table: "LeaveCancellations",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveCancellations_LeaveRequestId",
                table: "LeaveCancellations",
                column: "LeaveRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveCancellations_StatusId",
                table: "LeaveCancellations",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveInterruptions_EmployeeId",
                table: "LeaveInterruptions",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveInterruptions_InterruptedByUserId",
                table: "LeaveInterruptions",
                column: "InterruptedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveInterruptions_IsDeleted",
                table: "LeaveInterruptions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveInterruptions_LeaveRequestId",
                table: "LeaveInterruptions",
                column: "LeaveRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveInterruptions_StatusId",
                table: "LeaveInterruptions",
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
                name: "IX_LeaveRequests_ApprovedByUserId",
                table: "LeaveRequests",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_CancelledByUserId",
                table: "LeaveRequests",
                column: "CancelledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_CreatedByUserId",
                table: "LeaveRequests",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId",
                table: "LeaveRequests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId_Status",
                table: "LeaveRequests",
                columns: new[] { "EmployeeId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_IsDeleted",
                table: "LeaveRequests",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_LeaveType",
                table: "LeaveRequests",
                column: "LeaveType");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_OrganizationalUnitId",
                table: "LeaveRequests",
                column: "OrganizationalUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_RequestNumber",
                table: "LeaveRequests",
                column: "RequestNumber",
                unique: true,
                filter: "\"RequestNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_StartDate_EndDate",
                table: "LeaveRequests",
                columns: new[] { "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_Status",
                table: "LeaveRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_StatusId",
                table: "LeaveRequests",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeaveBalanceHistories");

            migrationBuilder.DropTable(
                name: "LeaveBalances");

            migrationBuilder.DropTable(
                name: "LeaveCancellations");

            migrationBuilder.DropTable(
                name: "LeaveInterruptions");

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

            migrationBuilder.DropTable(
                name: "LeaveRequests");
        }
    }
}
