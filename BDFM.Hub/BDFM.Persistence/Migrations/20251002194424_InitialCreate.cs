using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrimaryTableId = table.Column<Guid>(type: "uuid", nullable: true),
                    TableName = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FileName = table.Column<string>(type: "text", nullable: true),
                    FilePath = table.Column<string>(type: "text", nullable: true),
                    FileExtension = table.Column<string>(type: "text", nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    OcrText = table.Column<string>(type: "text", nullable: true),
                    Secret = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AutomationExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AutomatedProcessId = table.Column<Guid>(type: "uuid", nullable: true),
                    AutomatedProcessType = table.Column<string>(type: "text", nullable: false),
                    TriggeringEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggeringEntityType = table.Column<string>(type: "text", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    OutputDetailsJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_AutomationExecutionLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BusinessRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    TriggerEvent = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_BusinessRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExternalEntities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    EntityCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntityType = table.Column<int>(type: "integer", nullable: true),
                    ContactInfo = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_ExternalEntities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationalUnits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UnitCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UnitDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ParentUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    UnitType = table.Column<int>(type: "integer", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    UnitLogo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    UnitLevel = table.Column<int>(type: "integer", nullable: true),
                    CanReceiveExternalMail = table.Column<bool>(type: "boolean", nullable: false),
                    CanSendExternalMail = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_OrganizationalUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationalUnits_OrganizationalUnits_ParentUnitId",
                        column: x => x.ParentUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SequentialCounters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    CurrentValue = table.Column<int>(type: "integer", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_SequentialCounters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemIntegrationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SystemName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    IntegrationType = table.Column<string>(type: "text", nullable: false),
                    BaseUrl = table.Column<string>(type: "text", nullable: true),
                    ApiKey = table.Column<string>(type: "text", nullable: true),
                    Username = table.Column<string>(type: "text", nullable: true),
                    EncryptedPassword = table.Column<string>(type: "text", nullable: true),
                    ConnectionString = table.Column<string>(type: "text", nullable: true),
                    OtherParametersJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_SystemIntegrationSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemTagTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DefaultColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    IsAutoCreateEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    NameAr = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DescriptionAr = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
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
                    table.PrimaryKey("PK_SystemTagTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TodoTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_TodoTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AutomationStepExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AutomationExecutionLogId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepDefinitionId = table.Column<Guid>(type: "uuid", nullable: true),
                    StepName = table.Column<string>(type: "text", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DetailsJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_AutomationStepExecutionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AutomationStepExecutionLogs_AutomationExecutionLogs_Automat~",
                        column: x => x.AutomationExecutionLogId,
                        principalTable: "AutomationExecutionLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RuleActions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessRuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<string>(type: "text", nullable: false),
                    ParametersJson = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_RuleActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RuleActions_BusinessRules_BusinessRuleId",
                        column: x => x.BusinessRuleId,
                        principalTable: "BusinessRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RuleConditions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessRuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldName = table.Column<string>(type: "text", nullable: false),
                    Operator = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    LogicalOperatorWithNext = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_RuleConditions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RuleConditions_BusinessRules_BusinessRuleId",
                        column: x => x.BusinessRuleId,
                        principalTable: "BusinessRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomWorkflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TriggeringUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggeringCorrespondenceType = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_CustomWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomWorkflows_OrganizationalUnits_TriggeringUnitId",
                        column: x => x.TriggeringUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PermittedExternalEntityCommunications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalEntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    CanSend = table.Column<bool>(type: "boolean", nullable: false),
                    CanReceive = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresSignatureLevel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
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
                    table.PrimaryKey("PK_PermittedExternalEntityCommunications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PermittedExternalEntityCommunications_ExternalEntities_Exte~",
                        column: x => x.ExternalEntityId,
                        principalTable: "ExternalEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PermittedExternalEntityCommunications_OrganizationalUnits_O~",
                        column: x => x.OrganizationalUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UserLogin = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    PositionTitle = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    RfidTagId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorSecret = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_OrganizationalUnits_OrganizationalUnitId",
                        column: x => x.OrganizationalUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UnitPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    GrantedBySystemAdmin = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_UnitPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UnitPermissions_OrganizationalUnits_UnitId",
                        column: x => x.UnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UnitPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IntegrationActivityLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SystemIntegrationSettingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActionName = table.Column<string>(type: "text", nullable: false),
                    WasSuccessful = table.Column<bool>(type: "boolean", nullable: false),
                    RequestDetails = table.Column<string>(type: "text", nullable: true),
                    ResponseDetailsOrError = table.Column<string>(type: "text", nullable: true),
                    RelatedCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_IntegrationActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntegrationActivityLogs_SystemIntegrationSettings_SystemInt~",
                        column: x => x.SystemIntegrationSettingId,
                        principalTable: "SystemIntegrationSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomWorkflowSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    TargetIdentifier = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    DefaultInstructionText = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DefaultDueDateOffsetDays = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_CustomWorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomWorkflowSteps_CustomWorkflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "CustomWorkflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdvancedAlertRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AlertName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConditionLogic = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ConditionParametersJson = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetRoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    NotificationMessageTemplate = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    NotificationChannel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_AdvancedAlertRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdvancedAlertRules_Roles_TargetRoleId",
                        column: x => x.TargetRoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AdvancedAlertRules_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AdvancedAlertRules_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Action = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AffectedEntity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AffectedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
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
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CorrespondenceTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    BodyText = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_CorrespondenceTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceTemplates_OrganizationalUnits_OrganizationalU~",
                        column: x => x.OrganizationalUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CorrespondenceTemplates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Delegations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DelegatorUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DelegateeUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_Delegations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Delegations_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Delegations_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Delegations_Users_DelegateeUserId",
                        column: x => x.DelegateeUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Delegations_Users_DelegatorUserId",
                        column: x => x.DelegatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MailFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_MailFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MailFiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    IsSystemTag = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrganizationalUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
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
                    table.PrimaryKey("PK_Tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tags_OrganizationalUnits_OrganizationalUnitId",
                        column: x => x.OrganizationalUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tags_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdvancedAlertTriggerLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdvancedAlertRuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggeredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RelatedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Details = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_AdvancedAlertTriggerLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdvancedAlertTriggerLogs_AdvancedAlertRules_AdvancedAlertRu~",
                        column: x => x.AdvancedAlertRuleId,
                        principalTable: "AdvancedAlertRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Correspondences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileId = table.Column<Guid>(type: "uuid", nullable: true),
                    CorrespondenceType = table.Column<int>(type: "integer", nullable: false),
                    ExternalReferenceNumber = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ExternalReferenceDate = table.Column<DateOnly>(type: "date", nullable: true),
                    MailNum = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    MailDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    BodyText = table.Column<string>(type: "text", nullable: true),
                    SecrecyLevel = table.Column<int>(type: "integer", nullable: false),
                    PriorityLevel = table.Column<int>(type: "integer", nullable: false),
                    PersonalityLevel = table.Column<int>(type: "integer", nullable: false),
                    HasAttachments = table.Column<bool>(type: "boolean", nullable: false),
                    AttachmentCount = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SignatoryUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    OcrText = table.Column<string>(type: "text", nullable: true),
                    IsDraft = table.Column<bool>(type: "boolean", nullable: false),
                    FinalizedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExternalEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreateByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ParentCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_Correspondences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Correspondences_Correspondences_ParentCorrespondenceId",
                        column: x => x.ParentCorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Correspondences_ExternalEntities_ExternalEntityId",
                        column: x => x.ExternalEntityId,
                        principalTable: "ExternalEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Correspondences_MailFiles_FileId",
                        column: x => x.FileId,
                        principalTable: "MailFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Correspondences_Users_CreateBy",
                        column: x => x.CreateBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Correspondences_Users_CreateByUserId",
                        column: x => x.CreateByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Correspondences_Users_SignatoryUserId",
                        column: x => x.SignatoryUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CorrespondenceLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    LinkedCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    LinkType = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_CorrespondenceLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceLinks_Correspondences_LinkedCorrespondenceId",
                        column: x => x.LinkedCorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CorrespondenceLinks_Correspondences_SourceCorrespondenceId",
                        column: x => x.SourceCorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CorrespondenceTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppliedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsPrivateTag = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Priority = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
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
                    table.PrimaryKey("PK_CorrespondenceTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceTags_Correspondences_CorrespondenceId",
                        column: x => x.CorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CorrespondenceTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CorrespondenceTags_Users_AppliedByUserId",
                        column: x => x.AppliedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DraftVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    BodyText = table.Column<string>(type: "text", nullable: true),
                    ChangedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangeTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChangeReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_DraftVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DraftVersions_Correspondences_CorrespondenceId",
                        column: x => x.CorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DraftVersions_Users_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RelatedPriorities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrimaryCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    PriorityCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("PK_RelatedPriorities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RelatedPriorities_Correspondences_PrimaryCorrespondenceId",
                        column: x => x.PrimaryCorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RelatedPriorities_Correspondences_PriorityCorrespondenceId",
                        column: x => x.PriorityCorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RelatedPriorities_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserCorrespondenceInteractions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsStarred = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PostponedUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsInTrash = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ReceiveNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_UserCorrespondenceInteractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCorrespondenceInteractions_Correspondences_Corresponden~",
                        column: x => x.CorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCorrespondenceInteractions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    FromUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    FromUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    ToPrimaryRecipientType = table.Column<int>(type: "integer", nullable: false),
                    ToPrimaryRecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    InstructionText = table.Column<string>(type: "text", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsTimeSensitive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_WorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowSteps_Correspondences_CorrespondenceId",
                        column: x => x.CorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkflowSteps_OrganizationalUnits_FromUnitId",
                        column: x => x.FromUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkflowSteps_Users_FromUserId",
                        column: x => x.FromUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CorrespondenceComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowStepId = table.Column<Guid>(type: "uuid", nullable: true),
                    Text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UserLogin = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmployeeUnitName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    EmployeeUnitCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false),
                    CanEdit = table.Column<bool>(type: "boolean", nullable: false),
                    CanDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ParentCommentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Visibility = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_CorrespondenceComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceComments_CorrespondenceComments_ParentComment~",
                        column: x => x.ParentCommentId,
                        principalTable: "CorrespondenceComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CorrespondenceComments_Correspondences_CorrespondenceId",
                        column: x => x.CorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CorrespondenceComments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CorrespondenceComments_WorkflowSteps_WorkflowStepId",
                        column: x => x.WorkflowStepId,
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    LinkToCorrespondenceId = table.Column<Guid>(type: "uuid", nullable: true),
                    LinkToWorkflowStepId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    NotificationType = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Correspondences_LinkToCorrespondenceId",
                        column: x => x.LinkToCorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notifications_WorkflowSteps_LinkToWorkflowStepId",
                        column: x => x.LinkToWorkflowStepId,
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecipientActionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_RecipientActionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipientActionLogs_OrganizationalUnits_ActionTakenByUnitId",
                        column: x => x.ActionTakenByUnitId,
                        principalTable: "OrganizationalUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecipientActionLogs_Users_ActionTakenByUserId",
                        column: x => x.ActionTakenByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecipientActionLogs_WorkflowSteps_WorkflowStepId",
                        column: x => x.WorkflowStepId,
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowStepInteractions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_WorkflowStepInteractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowStepInteractions_Users_InteractingUserId",
                        column: x => x.InteractingUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkflowStepInteractions_WorkflowSteps_WorkflowStepId",
                        column: x => x.WorkflowStepId,
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowStepSecondaryRecipients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StepId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipientType = table.Column<int>(type: "integer", nullable: false),
                    RecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    Purpose = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    InstructionText = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_WorkflowStepSecondaryRecipients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowStepSecondaryRecipients_WorkflowSteps_StepId",
                        column: x => x.StepId,
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowStepTodos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    WorkflowStepId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_WorkflowStepTodos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowStepTodos_WorkflowSteps_WorkflowStepId",
                        column: x => x.WorkflowStepId,
                        principalTable: "WorkflowSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_AlertName",
                table: "AdvancedAlertRules",
                column: "AlertName");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_CreatedByUserId",
                table: "AdvancedAlertRules",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_IsActive",
                table: "AdvancedAlertRules",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_IsDeleted",
                table: "AdvancedAlertRules",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_StatusId",
                table: "AdvancedAlertRules",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_TargetRoleId",
                table: "AdvancedAlertRules",
                column: "TargetRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertRules_TargetUserId",
                table: "AdvancedAlertRules",
                column: "TargetUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertTriggerLogs_AdvancedAlertRuleId",
                table: "AdvancedAlertTriggerLogs",
                column: "AdvancedAlertRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertTriggerLogs_IsDeleted",
                table: "AdvancedAlertTriggerLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertTriggerLogs_RelatedEntityId",
                table: "AdvancedAlertTriggerLogs",
                column: "RelatedEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertTriggerLogs_StatusId",
                table: "AdvancedAlertTriggerLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AdvancedAlertTriggerLogs_TriggeredAt",
                table: "AdvancedAlertTriggerLogs",
                column: "TriggeredAt");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_IsDeleted",
                table: "Attachments",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_PrimaryTableId",
                table: "Attachments",
                column: "PrimaryTableId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_StatusId",
                table: "Attachments",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TableName",
                table: "Attachments",
                column: "TableName");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TableName_PrimaryTableId",
                table: "Attachments",
                columns: new[] { "TableName", "PrimaryTableId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_IsDeleted",
                table: "AuditLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_StatusId",
                table: "AuditLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AutomationExecutionLogs_IsDeleted",
                table: "AutomationExecutionLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_AutomationExecutionLogs_StatusId",
                table: "AutomationExecutionLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AutomationStepExecutionLogs_AutomationExecutionLogId",
                table: "AutomationStepExecutionLogs",
                column: "AutomationExecutionLogId");

            migrationBuilder.CreateIndex(
                name: "IX_AutomationStepExecutionLogs_IsDeleted",
                table: "AutomationStepExecutionLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_AutomationStepExecutionLogs_StatusId",
                table: "AutomationStepExecutionLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessRules_IsDeleted",
                table: "BusinessRules",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessRules_StatusId",
                table: "BusinessRules",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_CorrespondenceId",
                table: "CorrespondenceComments",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_CorrespondenceId_ParentCommentId",
                table: "CorrespondenceComments",
                columns: new[] { "CorrespondenceId", "ParentCommentId" });

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_CreateAt",
                table: "CorrespondenceComments",
                column: "CreateAt");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_IsDeleted",
                table: "CorrespondenceComments",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_ParentCommentId",
                table: "CorrespondenceComments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_StatusId",
                table: "CorrespondenceComments",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_UserId",
                table: "CorrespondenceComments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceComments_WorkflowStepId",
                table: "CorrespondenceComments",
                column: "WorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceLinks_IsDeleted",
                table: "CorrespondenceLinks",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceLinks_LinkedCorrespondenceId",
                table: "CorrespondenceLinks",
                column: "LinkedCorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceLinks_SourceCorrespondenceId",
                table: "CorrespondenceLinks",
                column: "SourceCorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceLinks_SourceCorrespondenceId_LinkedCorrespond~",
                table: "CorrespondenceLinks",
                columns: new[] { "SourceCorrespondenceId", "LinkedCorrespondenceId", "LinkType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceLinks_StatusId",
                table: "CorrespondenceLinks",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_CreateBy",
                table: "Correspondences",
                column: "CreateBy");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_CreateByUserId",
                table: "Correspondences",
                column: "CreateByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_ExternalEntityId",
                table: "Correspondences",
                column: "ExternalEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_ExternalReferenceNumber",
                table: "Correspondences",
                column: "ExternalReferenceNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_FileId",
                table: "Correspondences",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_IsDeleted",
                table: "Correspondences",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_MailNum",
                table: "Correspondences",
                column: "MailNum",
                unique: true,
                filter: "\"MailNum\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_ParentCorrespondenceId",
                table: "Correspondences",
                column: "ParentCorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_SignatoryUserId",
                table: "Correspondences",
                column: "SignatoryUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_StatusId",
                table: "Correspondences",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_AppliedByUserId",
                table: "CorrespondenceTags",
                column: "AppliedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_CorrespondenceId",
                table: "CorrespondenceTags",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_CorrespondenceId_TagId",
                table: "CorrespondenceTags",
                columns: new[] { "CorrespondenceId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_IsDeleted",
                table: "CorrespondenceTags",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_IsPrivateTag",
                table: "CorrespondenceTags",
                column: "IsPrivateTag");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_Priority",
                table: "CorrespondenceTags",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_StatusId",
                table: "CorrespondenceTags",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTags_TagId",
                table: "CorrespondenceTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTemplates_IsDeleted",
                table: "CorrespondenceTemplates",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTemplates_OrganizationalUnitId",
                table: "CorrespondenceTemplates",
                column: "OrganizationalUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTemplates_StatusId",
                table: "CorrespondenceTemplates",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTemplates_TemplateName",
                table: "CorrespondenceTemplates",
                column: "TemplateName");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTemplates_UserId",
                table: "CorrespondenceTemplates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflows_IsDeleted",
                table: "CustomWorkflows",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflows_StatusId",
                table: "CustomWorkflows",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflows_TriggeringUnitId",
                table: "CustomWorkflows",
                column: "TriggeringUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflows_WorkflowName",
                table: "CustomWorkflows",
                column: "WorkflowName");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflowSteps_IsDeleted",
                table: "CustomWorkflowSteps",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflowSteps_StatusId",
                table: "CustomWorkflowSteps",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflowSteps_StepOrder",
                table: "CustomWorkflowSteps",
                column: "StepOrder");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflowSteps_WorkflowId",
                table: "CustomWorkflowSteps",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomWorkflowSteps_WorkflowId_StepOrder",
                table: "CustomWorkflowSteps",
                columns: new[] { "WorkflowId", "StepOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_DelegateeUserId",
                table: "Delegations",
                column: "DelegateeUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_DelegatorUserId",
                table: "Delegations",
                column: "DelegatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_EndDate",
                table: "Delegations",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_IsActive",
                table: "Delegations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_IsDeleted",
                table: "Delegations",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_PermissionId",
                table: "Delegations",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_RoleId",
                table: "Delegations",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_StartDate",
                table: "Delegations",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Delegations_StatusId",
                table: "Delegations",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_DraftVersions_ChangedByUserId",
                table: "DraftVersions",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DraftVersions_CorrespondenceId",
                table: "DraftVersions",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_DraftVersions_CorrespondenceId_VersionNumber",
                table: "DraftVersions",
                columns: new[] { "CorrespondenceId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DraftVersions_IsDeleted",
                table: "DraftVersions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_DraftVersions_StatusId",
                table: "DraftVersions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalEntities_EntityCode",
                table: "ExternalEntities",
                column: "EntityCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalEntities_EntityName",
                table: "ExternalEntities",
                column: "EntityName");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalEntities_IsDeleted",
                table: "ExternalEntities",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalEntities_StatusId",
                table: "ExternalEntities",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationActivityLogs_IsDeleted",
                table: "IntegrationActivityLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationActivityLogs_StatusId",
                table: "IntegrationActivityLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationActivityLogs_SystemIntegrationSettingId",
                table: "IntegrationActivityLogs",
                column: "SystemIntegrationSettingId");

            migrationBuilder.CreateIndex(
                name: "IX_MailFiles_FileNumber",
                table: "MailFiles",
                column: "FileNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MailFiles_IsDeleted",
                table: "MailFiles",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_MailFiles_StatusId",
                table: "MailFiles",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_MailFiles_UserId",
                table: "MailFiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_IsDeleted",
                table: "Notifications",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_LinkToCorrespondenceId",
                table: "Notifications",
                column: "LinkToCorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_LinkToWorkflowStepId",
                table: "Notifications",
                column: "LinkToWorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_StatusId",
                table: "Notifications",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationalUnits_IsDeleted",
                table: "OrganizationalUnits",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationalUnits_ParentUnitId",
                table: "OrganizationalUnits",
                column: "ParentUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationalUnits_StatusId",
                table: "OrganizationalUnits",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationalUnits_UnitCode",
                table: "OrganizationalUnits",
                column: "UnitCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationalUnits_UnitName",
                table: "OrganizationalUnits",
                column: "UnitName");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_IsDeleted",
                table: "Permissions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Name",
                table: "Permissions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_StatusId",
                table: "Permissions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Value",
                table: "Permissions",
                column: "Value",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_CanReceive",
                table: "PermittedExternalEntityCommunications",
                column: "CanReceive");

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_CanSend",
                table: "PermittedExternalEntityCommunications",
                column: "CanSend");

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_ExternalEntityId",
                table: "PermittedExternalEntityCommunications",
                column: "ExternalEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_IsDeleted",
                table: "PermittedExternalEntityCommunications",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_OrganizationalUnitId",
                table: "PermittedExternalEntityCommunications",
                column: "OrganizationalUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_OrganizationalUnitId_~",
                table: "PermittedExternalEntityCommunications",
                columns: new[] { "OrganizationalUnitId", "ExternalEntityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PermittedExternalEntityCommunications_StatusId",
                table: "PermittedExternalEntityCommunications",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipientActionLogs_ActionTakenByUnitId",
                table: "RecipientActionLogs",
                column: "ActionTakenByUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipientActionLogs_ActionTakenByUserId",
                table: "RecipientActionLogs",
                column: "ActionTakenByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipientActionLogs_IsDeleted",
                table: "RecipientActionLogs",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_RecipientActionLogs_StatusId",
                table: "RecipientActionLogs",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipientActionLogs_WorkflowStepId",
                table: "RecipientActionLogs",
                column: "WorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_RelatedPriorities_IsDeleted",
                table: "RelatedPriorities",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_RelatedPriorities_PrimaryCorrespondenceId",
                table: "RelatedPriorities",
                column: "PrimaryCorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_RelatedPriorities_PrimaryCorrespondenceId_PriorityCorrespon~",
                table: "RelatedPriorities",
                columns: new[] { "PrimaryCorrespondenceId", "PriorityCorrespondenceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RelatedPriorities_PriorityCorrespondenceId",
                table: "RelatedPriorities",
                column: "PriorityCorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_RelatedPriorities_StatusId",
                table: "RelatedPriorities",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_RelatedPriorities_UserId",
                table: "RelatedPriorities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_IsDeleted",
                table: "Roles",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_StatusId",
                table: "Roles",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Value",
                table: "Roles",
                column: "Value",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RuleActions_BusinessRuleId",
                table: "RuleActions",
                column: "BusinessRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_RuleActions_IsDeleted",
                table: "RuleActions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_RuleActions_StatusId",
                table: "RuleActions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_RuleConditions_BusinessRuleId",
                table: "RuleConditions",
                column: "BusinessRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_RuleConditions_IsDeleted",
                table: "RuleConditions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_RuleConditions_StatusId",
                table: "RuleConditions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_SequentialCounters_IsDeleted",
                table: "SequentialCounters",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_SequentialCounters_StatusId",
                table: "SequentialCounters",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemIntegrationSettings_IsDeleted",
                table: "SystemIntegrationSettings",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_SystemIntegrationSettings_StatusId",
                table: "SystemIntegrationSettings",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemTagTemplates_Category",
                table: "SystemTagTemplates",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_SystemTagTemplates_IsActive",
                table: "SystemTagTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SystemTagTemplates_IsDeleted",
                table: "SystemTagTemplates",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_SystemTagTemplates_Name",
                table: "SystemTagTemplates",
                column: "Name",
                unique: true,
                filter: "\"Name\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SystemTagTemplates_SortOrder",
                table: "SystemTagTemplates",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_SystemTagTemplates_StatusId",
                table: "SystemTagTemplates",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Category",
                table: "Tags",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_CreatedByUserId",
                table: "Tags",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_IsDeleted",
                table: "Tags",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_IsPublic",
                table: "Tags",
                column: "IsPublic");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_IsSystemTag",
                table: "Tags",
                column: "IsSystemTag");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "Tags",
                column: "Name",
                unique: true,
                filter: "\"Name\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_OrganizationalUnitId",
                table: "Tags",
                column: "OrganizationalUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_StatusId",
                table: "Tags",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_UsageCount",
                table: "Tags",
                column: "UsageCount");

            migrationBuilder.CreateIndex(
                name: "IX_TodoTemplates_IsDeleted",
                table: "TodoTemplates",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_TodoTemplates_StatusId",
                table: "TodoTemplates",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitPermissions_IsDeleted",
                table: "UnitPermissions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_UnitPermissions_PermissionId",
                table: "UnitPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitPermissions_StatusId",
                table: "UnitPermissions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitPermissions_UnitId",
                table: "UnitPermissions",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitPermissions_UnitId_PermissionId",
                table: "UnitPermissions",
                columns: new[] { "UnitId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_CorrespondenceId",
                table: "UserCorrespondenceInteractions",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_IsDeleted",
                table: "UserCorrespondenceInteractions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_IsInTrash",
                table: "UserCorrespondenceInteractions",
                column: "IsInTrash");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_IsRead",
                table: "UserCorrespondenceInteractions",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_IsStarred",
                table: "UserCorrespondenceInteractions",
                column: "IsStarred");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_PostponedUntil",
                table: "UserCorrespondenceInteractions",
                column: "PostponedUntil");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_ReceiveNotifications",
                table: "UserCorrespondenceInteractions",
                column: "ReceiveNotifications");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_StatusId",
                table: "UserCorrespondenceInteractions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_UserId",
                table: "UserCorrespondenceInteractions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCorrespondenceInteractions_UserId_CorrespondenceId",
                table: "UserCorrespondenceInteractions",
                columns: new[] { "UserId", "CorrespondenceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_IsDeleted",
                table: "UserPermissions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_PermissionId",
                table: "UserPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_StatusId",
                table: "UserPermissions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId_PermissionId",
                table: "UserPermissions",
                columns: new[] { "UserId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_IsDeleted",
                table: "UserRoles",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_StatusId",
                table: "UserRoles",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId_RoleId",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "\"Email\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_IsDeleted",
                table: "Users",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Users_OrganizationalUnitId",
                table: "Users",
                column: "OrganizationalUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RfidTagId",
                table: "Users",
                column: "RfidTagId",
                unique: true,
                filter: "\"RfidTagId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_StatusId",
                table: "Users",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserLogin",
                table: "Users",
                column: "UserLogin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepInteractions_InteractingUserId",
                table: "WorkflowStepInteractions",
                column: "InteractingUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepInteractions_IsDeleted",
                table: "WorkflowStepInteractions",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepInteractions_StatusId",
                table: "WorkflowStepInteractions",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepInteractions_WorkflowStepId",
                table: "WorkflowStepInteractions",
                column: "WorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepInteractions_WorkflowStepId_InteractingUserId",
                table: "WorkflowStepInteractions",
                columns: new[] { "WorkflowStepId", "InteractingUserId" },
                unique: true,
                filter: "\"InteractingUserId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_CorrespondenceId",
                table: "WorkflowSteps",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_CorrespondenceId_Status",
                table: "WorkflowSteps",
                columns: new[] { "CorrespondenceId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_FromUnitId",
                table: "WorkflowSteps",
                column: "FromUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_FromUserId",
                table: "WorkflowSteps",
                column: "FromUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_IsDeleted",
                table: "WorkflowSteps",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_StatusId",
                table: "WorkflowSteps",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_ToPrimaryRecipientId",
                table: "WorkflowSteps",
                column: "ToPrimaryRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_ToPrimaryRecipientId_ToPrimaryRecipientType_S~",
                table: "WorkflowSteps",
                columns: new[] { "ToPrimaryRecipientId", "ToPrimaryRecipientType", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepSecondaryRecipients_IsDeleted",
                table: "WorkflowStepSecondaryRecipients",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepSecondaryRecipients_RecipientId",
                table: "WorkflowStepSecondaryRecipients",
                column: "RecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepSecondaryRecipients_StatusId",
                table: "WorkflowStepSecondaryRecipients",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepSecondaryRecipients_StepId",
                table: "WorkflowStepSecondaryRecipients",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepSecondaryRecipients_StepId_RecipientId_Recipien~",
                table: "WorkflowStepSecondaryRecipients",
                columns: new[] { "StepId", "RecipientId", "RecipientType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepTodos_DueDate",
                table: "WorkflowStepTodos",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepTodos_IsCompleted",
                table: "WorkflowStepTodos",
                column: "IsCompleted");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepTodos_IsDeleted",
                table: "WorkflowStepTodos",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepTodos_StatusId",
                table: "WorkflowStepTodos",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepTodos_WorkflowStepId",
                table: "WorkflowStepTodos",
                column: "WorkflowStepId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowStepTodos_WorkflowStepId_IsCompleted",
                table: "WorkflowStepTodos",
                columns: new[] { "WorkflowStepId", "IsCompleted" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdvancedAlertTriggerLogs");

            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "AutomationStepExecutionLogs");

            migrationBuilder.DropTable(
                name: "CorrespondenceComments");

            migrationBuilder.DropTable(
                name: "CorrespondenceLinks");

            migrationBuilder.DropTable(
                name: "CorrespondenceTags");

            migrationBuilder.DropTable(
                name: "CorrespondenceTemplates");

            migrationBuilder.DropTable(
                name: "CustomWorkflowSteps");

            migrationBuilder.DropTable(
                name: "Delegations");

            migrationBuilder.DropTable(
                name: "DraftVersions");

            migrationBuilder.DropTable(
                name: "IntegrationActivityLogs");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PermittedExternalEntityCommunications");

            migrationBuilder.DropTable(
                name: "RecipientActionLogs");

            migrationBuilder.DropTable(
                name: "RelatedPriorities");

            migrationBuilder.DropTable(
                name: "RuleActions");

            migrationBuilder.DropTable(
                name: "RuleConditions");

            migrationBuilder.DropTable(
                name: "SequentialCounters");

            migrationBuilder.DropTable(
                name: "SystemTagTemplates");

            migrationBuilder.DropTable(
                name: "TodoTemplates");

            migrationBuilder.DropTable(
                name: "UnitPermissions");

            migrationBuilder.DropTable(
                name: "UserCorrespondenceInteractions");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "WorkflowStepInteractions");

            migrationBuilder.DropTable(
                name: "WorkflowStepSecondaryRecipients");

            migrationBuilder.DropTable(
                name: "WorkflowStepTodos");

            migrationBuilder.DropTable(
                name: "AdvancedAlertRules");

            migrationBuilder.DropTable(
                name: "AutomationExecutionLogs");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "CustomWorkflows");

            migrationBuilder.DropTable(
                name: "SystemIntegrationSettings");

            migrationBuilder.DropTable(
                name: "BusinessRules");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "WorkflowSteps");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Correspondences");

            migrationBuilder.DropTable(
                name: "ExternalEntities");

            migrationBuilder.DropTable(
                name: "MailFiles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "OrganizationalUnits");
        }
    }
}
