using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Url_Shortner.Migrations
{
    /// <inheritdoc />
    public partial class ClicksAddedToUrlRetry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clicks_Clicks_ClickId1",
                table: "Clicks");

            migrationBuilder.DropIndex(
                name: "IX_Clicks_ClickId1",
                table: "Clicks");

            migrationBuilder.DropColumn(
                name: "ClickId1",
                table: "Clicks");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClickId1",
                table: "Clicks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clicks_ClickId1",
                table: "Clicks",
                column: "ClickId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Clicks_Clicks_ClickId1",
                table: "Clicks",
                column: "ClickId1",
                principalTable: "Clicks",
                principalColumn: "ClickId");
        }
    }
}
