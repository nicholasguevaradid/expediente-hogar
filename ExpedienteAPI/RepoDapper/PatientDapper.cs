using Dapper;
using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace RepoDapper
{
    public class PatientDapper : IPatientDapper
    {
        private readonly SqlConnection _sqlconnection;

        public PatientDapper(IRepositorioDapper repositorioDapper)
        {
            _sqlconnection = repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> CreatePatient(PatientBase patient)
        {
            var result = await _sqlconnection.ExecuteScalarAsync<decimal>(
                "dbo.CreatePatient",
                new
                {
                    patient.Identificacion,
                    patient.FirstName,
                    patient.LastName,
                    patient.SecLastName,
                    patient.Birth_Date,
                    patient.Gender,
                    patient.PhoneNum,
                    patient.EmergencyNum,
                    patient.EmergencyName,
                    patient.Email,
                    patient.AddressLine1,
                    patient.AddressLine2,
                    patient.Canton,
                    patient.TipoCasa,
                    patient.Estado,
                    patient.Observaciones
                },
                commandType: CommandType.StoredProcedure
            );

            return (int)result;
        }

        public async Task<int> UpdatePatient(int patientId, PatientBase patient)
        {
            await EnsurePatientExists(patientId);

            var rows = await _sqlconnection.ExecuteScalarAsync<int>(
                "dbo.UpdatePatient",
                new
                {
                    PatientId = patientId,
                    patient.Identificacion,
                    patient.FirstName,
                    patient.LastName,
                    patient.SecLastName,
                    patient.Birth_Date,
                    patient.Gender,
                    patient.PhoneNum,
                    patient.EmergencyNum,
                    patient.EmergencyName,
                    patient.Email,
                    patient.AddressLine1,
                    patient.AddressLine2,
                    patient.Canton,
                    patient.TipoCasa,
                    patient.Estado,
                    patient.Observaciones
                },
                commandType: CommandType.StoredProcedure
            );

            return rows; // RowsAffected
        }

        public async Task<int> DeletePatient(int patientId)
        {
            await EnsurePatientExists(patientId);

            var rows = await _sqlconnection.ExecuteScalarAsync<int>(
                "dbo.DeletePatient",
                new { PatientId = patientId },
                commandType: CommandType.StoredProcedure
            );

            return rows; // RowsAffected
        }

        public async Task<PatientResponse?> GetPatientById(int patientId)
        {
            var patient = await _sqlconnection.QueryFirstOrDefaultAsync<PatientResponse>(
                "dbo.GetPatientById",
                new { PatientId = patientId },
                commandType: CommandType.StoredProcedure
            );

            return patient;
        }

        public async Task<PaginatedResult<PatientResponse>> ListPatients(string? search = null, string? estado = null, int page = 1, int pageSize = 20)
        {
            using var multi = await _sqlconnection.QueryMultipleAsync(
                "dbo.ListPatients",
                new { Search = search, Estado = estado, Page = page, PageSize = pageSize },
                commandType: CommandType.StoredProcedure
            );

            var total = await multi.ReadFirstAsync<int>();
            var data  = (await multi.ReadAsync<PatientResponse>()).ToList();

            return new PaginatedResult<PatientResponse>
            {
                Data     = data,
                Page     = page,
                PageSize = pageSize,
                Total    = total
            };
        }

        public async Task<PatientWithRecordsResponse?> GetPatientWithRecords(int patientId)
        {
            using var multi = await _sqlconnection.QueryMultipleAsync(
                "dbo.GetPatientWithRecords",
                new { PatientId = patientId },
                commandType: CommandType.StoredProcedure
            );

            var patient = await multi.ReadFirstOrDefaultAsync<PatientResponse>();
            if (patient is null) return null;

            var records = (await multi.ReadAsync<MedicalRecordResponse>()).ToList();

            return new PatientWithRecordsResponse
            {
                Patient = patient,
                Records = records
            };
        }

        public async Task<IEnumerable<PatientResponse>> ExportPatients(string? search, string? estado)
        {
            using var multi = await _sqlconnection.QueryMultipleAsync(
                "dbo.ListPatients",
                new { Search = search, Estado = estado, Page = 1, PageSize = 99999 },
                commandType: CommandType.StoredProcedure
            );
            await multi.ReadFirstAsync<int>(); // skip total count
            return (await multi.ReadAsync<PatientResponse>()).ToList();
        }

        public async Task<StatsResponse> GetStats()
        {
            using var multi = await _sqlconnection.QueryMultipleAsync(
                "dbo.GetStats",
                commandType: CommandType.StoredProcedure
            );

            var totals  = await multi.ReadFirstAsync<StatsResponse>();
            var records = await multi.ReadFirstAsync<int>();
            var recent  = (await multi.ReadAsync<RecentPatient>()).ToList();

            totals.TotalRecords    = records;
            totals.RecentPatients  = recent;
            return totals;
        }

        private async Task EnsurePatientExists(int patientId)
        {
            var existing = await GetPatientById(patientId);
            if (existing is null)
                throw new Exception("El paciente no existe.");
        }
    }
}