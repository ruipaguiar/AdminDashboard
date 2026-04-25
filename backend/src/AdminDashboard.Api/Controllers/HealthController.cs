using Microsoft.AspNetCore.Mvc;

namespace AdminDashboard.Api.Controllers;

/// <summary>
/// Endpoints públicos de saúde e diagnóstico.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Ping simples para verificar que a API está a responder.
    /// </summary>
    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new
    {
        message = "pong",
        timestamp = DateTime.UtcNow,
        service = "AdminDashboard.Api",
        version = "1.0.0"
    });
}
