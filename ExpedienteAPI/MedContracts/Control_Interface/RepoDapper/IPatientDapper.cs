using MedContracts.Models;

namespace MedContracts.Control_Interface.RepoDapper
{
    public interface IPatientDapper
    {
        Task<PaginatedResult<PatientResponse>> ListPatients(string? search = null, string? estado = null, int page = 1, int pageSize = 20);
        Task<PatientResponse?> GetPatientById(int patientId);

        Task<int> CreatePatient(PatientBase patient);
        Task<int> UpdatePatient(int patientId, PatientBase patient);
        Task<int> DeletePatient(int patientId);

        Task<PatientWithRecordsResponse?> GetPatientWithRecords(int patientId);
    }
}