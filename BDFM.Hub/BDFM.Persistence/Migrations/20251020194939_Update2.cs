using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ActivatedAt",
                table: "WorkflowSteps",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "WorkflowSteps",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "WorkflowSteps",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Sequence",
                table: "WorkflowSteps",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivatedAt",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "WorkflowSteps");

            migrationBuilder.DropColumn(
                name: "Sequence",
                table: "WorkflowSteps");
        }
    }
}
