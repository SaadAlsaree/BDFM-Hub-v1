using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentCount",
                table: "Correspondences");

            migrationBuilder.DropColumn(
                name: "HasAttachments",
                table: "Correspondences");

            migrationBuilder.AddColumn<Guid>(
                name: "CorrespondenceOrganizationalUnitId",
                table: "Correspondences",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Correspondences_CorrespondenceOrganizationalUnitId",
                table: "Correspondences",
                column: "CorrespondenceOrganizationalUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_Correspondences_OrganizationalUnits_CorrespondenceOrganizat~",
                table: "Correspondences",
                column: "CorrespondenceOrganizationalUnitId",
                principalTable: "OrganizationalUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Correspondences_OrganizationalUnits_CorrespondenceOrganizat~",
                table: "Correspondences");

            migrationBuilder.DropIndex(
                name: "IX_Correspondences_CorrespondenceOrganizationalUnitId",
                table: "Correspondences");

            migrationBuilder.DropColumn(
                name: "CorrespondenceOrganizationalUnitId",
                table: "Correspondences");

            migrationBuilder.AddColumn<int>(
                name: "AttachmentCount",
                table: "Correspondences",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasAttachments",
                table: "Correspondences",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
