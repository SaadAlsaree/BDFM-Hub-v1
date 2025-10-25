using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "CustomWorkflowSteps",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Sequence",
                table: "CustomWorkflowSteps",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "CustomWorkflowSteps");

            migrationBuilder.DropColumn(
                name: "Sequence",
                table: "CustomWorkflowSteps");
        }
    }
}
