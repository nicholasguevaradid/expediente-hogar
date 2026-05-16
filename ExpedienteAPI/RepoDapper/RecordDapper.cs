using Dapper;
using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace RepoDapper
{
    public class RecordDapper : IRecordDapper
    {
        private readonly SqlConnection _sqlconnection;

        public RecordDapper(IRepositorioDapper repositorioDapper)
        {
            _sqlconnection = repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> CreateMedicalRecord(MedicalRecordBase record)
        {
            var result = await _sqlconnection.ExecuteScalarAsync<decimal>(
                "dbo.CreateMedicalRecord",
                new
                {
                    record.PatientId,
                    record.VisitDate,
                    record.LegalName,
                    record.Hist_Diagnosis,
                    record.Diagnosis,
                    record.Alergies,
                    record.Perscrption,
                    record.Notes,
                    record.HeightCm,
                    record.WeightKg,
                    record.BloodPressure,
                    record.TemperatureC
                },
                commandType: CommandType.StoredProcedure
            );

            return (int)result; // MedicalRecordId
        }

        public async Task<int> UpdateMedicalRecord(int medicalRecordId, MedicalRecordBase record)
        {
            await EnsureMedicalRecordExists(medicalRecordId);

            var rows = await _sqlconnection.ExecuteScalarAsync<int>(
                "dbo.UpdateMedicalRecord",
                new
                {
                    MedicalRecordId = medicalRecordId,
                    record.VisitDate,
                    record.LegalName,
                    record.Hist_Diagnosis,
                    record.Diagnosis,
                    record.Alergies,
                    record.Perscrption,
                    record.Notes,
                    record.HeightCm,
                    record.WeightKg,
                    record.BloodPressure,
                    record.TemperatureC
                },
                commandType: CommandType.StoredProcedure
            );

            return rows; // RowsAffected
        }

        public async Task<int> DeleteMedicalRecord(int medicalRecordId)
        {
            await EnsureMedicalRecordExists(medicalRecordId);

            var rows = await _sqlconnection.ExecuteScalarAsync<int>(
                "dbo.DeleteMedicalRecord",
                new { MedicalRecordId = medicalRecordId },
                commandType: CommandType.StoredProcedure
            );

            return rows; // RowsAffected
        }

        public async Task<MedicalRecordResponse?> GetMedicalRecordById(int medicalRecordId)
        {
            var record = await _sqlconnection.QueryFirstOrDefaultAsync<MedicalRecordResponse>(
                "dbo.GetMedicalRecordById",
                new { MedicalRecordId = medicalRecordId },
                commandType: CommandType.StoredProcedure
            );

            return record;
        }

        public async Task<IEnumerable<MedicalRecordResponse>> ListMedicalRecordsByPatient(int patientId)
        {
            var records = await _sqlconnection.QueryAsync<MedicalRecordResponse>(
                "dbo.ListMedicalRecordsByPatient",
                new { PatientId = patientId },
                commandType: CommandType.StoredProcedure
            );

            return records;
        }

        private async Task EnsureMedicalRecordExists(int medicalRecordId)
        {
            var existing = await GetMedicalRecordById(medicalRecordId);
            if (existing is null)
                throw new Exception("El record no existe.");
        }
    }
}