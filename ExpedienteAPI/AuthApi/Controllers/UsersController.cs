using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthApi.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Produces("application/json")]
    [Tags("Users")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserDapper _users;

        public UsersController(IUserDapper users)
        {
            _users = users;
        }

        // GET /api/users
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserListItem>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List()
        {
            var list = await _users.ListUsers();
            return Ok(list);
        }

        // POST /api/users
        [HttpPost]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var hash  = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var newId = await _users.CreateUser(request.Username, hash, request.Role);
                return CreatedAtAction(nameof(List), new { }, new { userId = newId });
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        // PUT /api/users/{id}
        [HttpPut("{userId:int}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] int userId, [FromBody] UpdateUserRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var rows = await _users.UpdateUser(userId, request.Role, request.IsActive);
                if (rows <= 0) return NotFound(ApiError(404, "Usuario no encontrado."));
                return Ok(new { updated = rows });
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        // PUT /api/users/{id}/password
        [HttpPut("{userId:int}/password")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ChangePassword([FromRoute] int userId, [FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var hash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                var rows = await _users.ChangePassword(userId, hash);
                if (rows <= 0) return NotFound(ApiError(404, "Usuario no encontrado."));
                return Ok(new { updated = rows });
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        private static object ApiError(int status, string message) => new
        {
            message,
            status,
            timestamp = DateTime.UtcNow
        };
    }
}
