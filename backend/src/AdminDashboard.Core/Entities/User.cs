namespace AdminDashboard.Core.Entities;

/// <summary>
/// Utilizador da aplicação. Para já é uso pessoal, mas a estrutura
/// suporta múltiplos utilizadores (família, amigos próximos).
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    public string Role { get; set; } = "User"; // "Admin" | "User"
}
