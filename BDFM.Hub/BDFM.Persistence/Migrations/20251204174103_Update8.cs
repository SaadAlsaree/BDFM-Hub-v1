using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_OrganizationalUnits_ForOrganizationalUnitId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Users_ForUserId",
                table: "Tags");

            migrationBuilder.RenameColumn(
                name: "ForUserId",
                table: "Tags",
                newName: "FromUserId");

            migrationBuilder.RenameColumn(
                name: "ForOrganizationalUnitId",
                table: "Tags",
                newName: "FromUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_ForUserId",
                table: "Tags",
                newName: "IX_Tags_FromUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_ForOrganizationalUnitId",
                table: "Tags",
                newName: "IX_Tags_FromUnitId");

            migrationBuilder.AddColumn<Guid>(
                name: "CorrespondenceId1",
                table: "Tags",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ToPrimaryRecipientId",
                table: "Tags",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "ToPrimaryRecipientType",
                table: "Tags",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Tags_CorrespondenceId1",
                table: "Tags",
                column: "CorrespondenceId1");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_ToPrimaryRecipientId",
                table: "Tags",
                column: "ToPrimaryRecipientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId1",
                table: "Tags",
                column: "CorrespondenceId1",
                principalTable: "Correspondences",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_OrganizationalUnits_FromUnitId",
                table: "Tags",
                column: "FromUnitId",
                principalTable: "OrganizationalUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Users_FromUserId",
                table: "Tags",
                column: "FromUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId1",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_OrganizationalUnits_FromUnitId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Users_FromUserId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_CorrespondenceId1",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_ToPrimaryRecipientId",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "CorrespondenceId1",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "ToPrimaryRecipientId",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "ToPrimaryRecipientType",
                table: "Tags");

            migrationBuilder.RenameColumn(
                name: "FromUserId",
                table: "Tags",
                newName: "ForUserId");

            migrationBuilder.RenameColumn(
                name: "FromUnitId",
                table: "Tags",
                newName: "ForOrganizationalUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_FromUserId",
                table: "Tags",
                newName: "IX_Tags_ForUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_FromUnitId",
                table: "Tags",
                newName: "IX_Tags_ForOrganizationalUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_OrganizationalUnits_ForOrganizationalUnitId",
                table: "Tags",
                column: "ForOrganizationalUnitId",
                principalTable: "OrganizationalUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Users_ForUserId",
                table: "Tags",
                column: "ForUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
