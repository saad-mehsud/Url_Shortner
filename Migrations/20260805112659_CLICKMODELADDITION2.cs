using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Url_Shortner.Migrations
{
    /// <inheritdoc />
    public partial class CLICKMODELADDITION2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clicks",
                columns: table => new
                {
                    ClickId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UrlId = table.Column<int>(type: "integer", nullable: false),
                    DateClicke = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    referrer = table.Column<string>(type: "text", nullable: true),
                    ipAddress = table.Column<string>(type: "text", nullable: true),
                    ClickId1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clicks", x => x.ClickId);
                    table.ForeignKey(
                        name: "FK_Clicks_Clicks_ClickId1",
                        column: x => x.ClickId1,
                        principalTable: "Clicks",
                        principalColumn: "ClickId");
                    table.ForeignKey(
                        name: "FK_Clicks_Urls_UrlId",
                        column: x => x.UrlId,
                        principalTable: "Urls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clicks_ClickId1",
                table: "Clicks",
                column: "ClickId1");

            migrationBuilder.CreateIndex(
                name: "IX_Clicks_UrlId",
                table: "Clicks",
                column: "UrlId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Clicks");
        }
    }
}
