using Dapper;
using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace RepoDapper
{
    public class UserDapper : IUserDapper
    {
        private readonly SqlConnection _sqlconnection;

        public UserDapper(IRepositorioDapper repositorioDapper)
        {
            _sqlconnection = repositorioDapper.ObtenerRepositorio();
        }

        public async Task<UserRecord?> GetByUsername(string username)
        {
            return await _sqlconnection.QueryFirstOrDefaultAsync<UserRecord>(
                "dbo.GetUserByUsername",
                new { Username = username },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<UserListItem>> ListUsers()
        {
            return await _sqlconnection.QueryAsync<UserListItem>(
                "dbo.ListUsers",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> CreateUser(string username, string passwordHash, string role = "Viewer")
        {
            var result = await _sqlconnection.ExecuteScalarAsync<decimal>(
                "dbo.CreateUser",
                new { Username = username, PasswordHash = passwordHash, Role = role },
                commandType: CommandType.StoredProcedure
            );
            return (int)result;
        }

        public async Task<int> UpdateUser(int userId, string role, bool isActive)
        {
            return await _sqlconnection.ExecuteScalarAsync<int>(
                "dbo.UpdateUser",
                new { UserId = userId, Role = role, IsActive = isActive },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<int> ChangePassword(int userId, string passwordHash)
        {
            return await _sqlconnection.ExecuteScalarAsync<int>(
                "dbo.ChangePassword",
                new { UserId = userId, PasswordHash = passwordHash },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
