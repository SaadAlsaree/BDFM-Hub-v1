using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_OrganizationalUnits_OrganizationalUnitId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Users_CreatedByUserId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_Category",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_IsPublic",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_IsSystemTag",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_UsageCount",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "IsSystemTag",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "UsageCount",
                table: "Tags");

            migrationBuilder.RenameColumn(
                name: "OrganizationalUnitId",
                table: "Tags",
                newName: "ForUserId");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Tags",
                newName: "ForOrganizationalUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_OrganizationalUnitId",
                table: "Tags",
                newName: "IX_Tags_ForUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_CreatedByUserId",
                table: "Tags",
                newName: "IX_Tags_ForOrganizationalUnitId");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Tags",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<Guid>(
                name: "CorrespondenceId",
                table: "Tags",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsAll",
                table: "Tags",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Tags_CorrespondenceId",
                table: "Tags",
                column: "CorrespondenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_CreateAt",
                table: "Tags",
                column: "CreateAt");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId",
                table: "Tags",
                column: "CorrespondenceId",
                principalTable: "Correspondences",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_OrganizationalUnits_ForOrganizationalUnitId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Users_ForUserId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_CorrespondenceId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_CreateAt",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "CorrespondenceId",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "IsAll",
                table: "Tags");

            migrationBuilder.RenameColumn(
                name: "ForUserId",
                table: "Tags",
                newName: "OrganizationalUnitId");

            migrationBuilder.RenameColumn(
                name: "ForOrganizationalUnitId",
                table: "Tags",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_ForUserId",
                table: "Tags",
                newName: "IX_Tags_OrganizationalUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_Tags_ForOrganizationalUnitId",
                table: "Tags",
                newName: "IX_Tags_CreatedByUserId");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Tags",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Tags",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tags",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Tags",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemTag",
                table: "Tags",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "UsageCount",
                table: "Tags",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Category",
                table: "Tags",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_IsPublic",
                table: "Tags",
                column: "IsPublic");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_IsSystemTag",
                table: "Tags",
                column: "IsSystemTag");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_UsageCount",
                table: "Tags",
                column: "UsageCount");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_OrganizationalUnits_OrganizationalUnitId",
                table: "Tags",
                column: "OrganizationalUnitId",
                principalTable: "OrganizationalUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Users_CreatedByUserId",
                table: "Tags",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
