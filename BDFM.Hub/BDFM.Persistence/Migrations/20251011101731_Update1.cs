using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "CustomWorkflowSteps",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CorrespondenceTimeline",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CorrespondenceId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
                    RelatedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_CorrespondenceTimeline", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceTimeline_Correspondences_CorrespondenceId",
                        column: x => x.CorrespondenceId,
                        principalTable: "Correspondences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTimeline_CorrespondenceId",
                table: "CorrespondenceTimeline",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTimeline_IsDeleted",
                table: "CorrespondenceTimeline",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceTimeline_StatusId",
                table: "CorrespondenceTimeline",
                column: "StatusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CorrespondenceTimeline");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "CustomWorkflowSteps");
        }
    }
}
