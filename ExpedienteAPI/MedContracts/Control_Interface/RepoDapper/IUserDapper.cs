using MedContracts.Models;

namespace MedContracts.Control_Interface.RepoDapper
{
    public interface IUserDapper
    {
        Task<UserRecord?> GetByUsername(string username);
        Task<IEnumerable<UserListItem>> ListUsers();
        Task<int> CreateUser(string username, string passwordHash, string role = "Viewer");
        Task<int> UpdateUser(int userId, string role, bool isActive);
        Task<int> ChangePassword(int userId, string passwordHash);
    }
}
