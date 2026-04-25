using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AdminDashboard.Infra.Persistence;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(GetConnectionString(args));

        return new AppDbContext(optionsBuilder.Options);
    }

    private static string GetConnectionString(string[] args)
    {
        var connectionString = GetArgumentValue(args, "--connection")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST");
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
        var database = Environment.GetEnvironmentVariable("POSTGRES_DB");
        var username = Environment.GetEnvironmentVariable("POSTGRES_USER");
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");

        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(database) ||
            string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Missing database configuration. Set ConnectionStrings__DefaultConnection or POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER and POSTGRES_PASSWORD.");
        }

        var builder = new DbConnectionStringBuilder
        {
            ["Host"] = host,
            ["Port"] = port,
            ["Database"] = database,
            ["Username"] = username,
            ["Password"] = password
        };

        return builder.ConnectionString;
    }

    private static string? GetArgumentValue(string[] args, string name)
    {
        var index = Array.IndexOf(args, name);
        return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
    }
}
