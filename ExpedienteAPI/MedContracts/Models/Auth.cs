using System.ComponentModel.DataAnnotations;

namespace MedContracts.Models
{
    public class LoginRequest
    {
        [Required, StringLength(60)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class UserRecord
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserListItem
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RegisterRequest
    {
        [Required, StringLength(60)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string Password { get; set; } = string.Empty;
    }

    public class CreateUserRequest
    {
        [Required, StringLength(60)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [StringLength(30)]
        public string Role { get; set; } = "Viewer";
    }

    public class UpdateUserRequest
    {
        [Required, StringLength(30)]
        public string Role { get; set; } = string.Empty;

        [Required]
        public bool IsActive { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required, MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
