using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDFM.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixCorrespondenceRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId",
                table: "Tags");

            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId1",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_CorrespondenceId1",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "CorrespondenceId1",
                table: "Tags");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId",
                table: "Tags",
                column: "CorrespondenceId",
                principalTable: "Correspondences",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId",
                table: "Tags");

            migrationBuilder.AddColumn<Guid>(
                name: "CorrespondenceId1",
                table: "Tags",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tags_CorrespondenceId1",
                table: "Tags",
                column: "CorrespondenceId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId",
                table: "Tags",
                column: "CorrespondenceId",
                principalTable: "Correspondences",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_Correspondences_CorrespondenceId1",
                table: "Tags",
                column: "CorrespondenceId1",
                principalTable: "Correspondences",
                principalColumn: "Id");
        }
    }
}
