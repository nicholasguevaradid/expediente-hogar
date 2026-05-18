using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ExpedienteAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [Produces("application/json")]
    [Tags("Auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserDapper _userDapper;
        private readonly IConfiguration _config;

        public AuthController(IUserDapper userDapper, IConfiguration config)
        {
            _userDapper = userDapper;
            _config = config;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var hash  = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var newId = await _userDapper.CreateUser(request.Username, hash, "Profesional");

                var user = new UserRecord
                {
                    UserId       = newId,
                    Username     = request.Username,
                    PasswordHash = hash,
                    Role         = "Viewer",
                    IsActive     = true,
                };
                var token = BuildToken(user);
                return CreatedAtAction(nameof(Login), token);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        // POST /api/auth/login
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var user = await _userDapper.GetByUsername(request.Username);
            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(ApiError(401, "Credenciales incorrectas."));

            var token = BuildToken(user);
            return Ok(token);
        }

        private LoginResponse BuildToken(UserRecord user)
        {
            var jwtSection = _config.GetSection("Jwt");
            var key        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
            var creds      = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var hours      = int.TryParse(jwtSection["ExpirationHours"], out var h) ? h : 8;
            var expires    = DateTime.UtcNow.AddHours(hours);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer:   jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims:   claims,
                expires:  expires,
                signingCredentials: creds
            );

            return new LoginResponse
            {
                Token     = new JwtSecurityTokenHandler().WriteToken(token),
                Username  = user.Username,
                Role      = user.Role,
                ExpiresAt = expires,
            };
        }

        private static object ApiError(int status, string message) => new
        {
            message,
            status,
            timestamp = DateTime.UtcNow
        };
    }
}
