using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdminDashboard.Infra.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultAdmin : Migration
    {
        private static readonly Guid AdminId = Guid.Parse("a1b2c3d4-0000-0000-0000-000000000001");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: ["Id", "Email", "PasswordHash", "DisplayName", "CreatedAt", "LastLoginAt", "IsActive", "Role"],
                values: [
                    AdminId,
                    "ruipaguiar@gmail.com",
                    "$2a$12$lpGLIxjW.hKgrEpETxC3bu/A5DB1IM66UOW5dD4YSTQuMZGr5uxcu",
                    "Rui Aguiar",
                    new DateTime(2026, 4, 25, 0, 0, 0, DateTimeKind.Utc),
                    null,
                    true,
                    "Admin"
                ]
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: AdminId);
        }
    }
}
