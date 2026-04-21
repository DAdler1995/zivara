using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zivara.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddJarTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JarConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CharacterId = table.Column<Guid>(type: "uuid", nullable: false),
                    WeeklyContribution = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JarConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JarConfigs_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JarWeeks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CharacterId = table.Column<Guid>(type: "uuid", nullable: false),
                    WeekStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MaxEarn = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    UnlockedPercent = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JarWeeks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JarWeeks_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JarWeekActivities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JarWeekId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityType = table.Column<int>(type: "integer", nullable: false),
                    ActivityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PercentAwarded = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JarWeekActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JarWeekActivities_JarWeeks_JarWeekId",
                        column: x => x.JarWeekId,
                        principalTable: "JarWeeks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JarConfigs_CharacterId",
                table: "JarConfigs",
                column: "CharacterId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JarWeekActivities_JarWeekId",
                table: "JarWeekActivities",
                column: "JarWeekId");

            migrationBuilder.CreateIndex(
                name: "IX_JarWeeks_CharacterId_WeekStartDate",
                table: "JarWeeks",
                columns: new[] { "CharacterId", "WeekStartDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JarConfigs");

            migrationBuilder.DropTable(
                name: "JarWeekActivities");

            migrationBuilder.DropTable(
                name: "JarWeeks");
        }
    }
}
