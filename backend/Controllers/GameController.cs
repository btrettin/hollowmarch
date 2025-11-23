using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api")]
public class GameController : ControllerBase
{
    [HttpGet("world")]
    public IActionResult GetWorld()
    {
        return Ok(new
        {
            serverTime = DateTime.UtcNow,
            motd = "Welcome to Hollowmarch number 4!",
        });
    }
}
