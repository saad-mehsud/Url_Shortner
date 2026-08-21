using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Url_Shortner.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenUserForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_userId",
                table: "RefreshTokens",
                column: "userId");

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_Users_userId",
                table: "RefreshTokens",
                column: "userId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_Users_userId",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_userId",
                table: "RefreshTokens");
        }
    }
}
