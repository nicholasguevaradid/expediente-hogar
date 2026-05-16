using MedContracts.Models;

namespace MedContracts.Control_Interface.RepoDapper
{
    public interface IUserDapper
    {
        Task<UserRecord?> GetByUsername(string username);
        Task<int> CreateUser(string username, string passwordHash, string role = "Viewer");
    }
}
