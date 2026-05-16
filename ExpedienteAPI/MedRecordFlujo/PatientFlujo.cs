using MedContracts.Control_Interface.Flujo;
using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;

namespace MedRecordFlujo
{
    public class PatientFlujo : IPatientFlujo
    {
        private readonly IPatientDapper _patientDapper;

        public PatientFlujo(IPatientDapper patientDapper)
        {
            _patientDapper = patientDapper;
        }

        public Task<PaginatedResult<PatientResponse>> ListPatients(string? search = null, string? estado = null, int page = 1, int pageSize = 20)
            => _patientDapper.ListPatients(search, estado, page, pageSize);

        public Task<PatientResponse?> GetPatientById(int patientId)
            => _patientDapper.GetPatientById(patientId);

        public Task<PatientWithRecordsResponse?> GetPatientWithRecords(int patientId)
            => _patientDapper.GetPatientWithRecords(patientId);

        public Task<int> CreatePatient(PatientBase patient)
            => _patientDapper.CreatePatient(patient);

        public Task<int> UpdatePatient(int patientId, PatientBase patient)
            => _patientDapper.UpdatePatient(patientId, patient);

        public Task<int> DeletePatient(int patientId)
            => _patientDapper.DeletePatient(patientId);

        public Task<IEnumerable<PatientResponse>> ExportPatients(string? search, string? estado)
            => _patientDapper.ExportPatients(search, estado);

        public Task<StatsResponse> GetStats()
            => _patientDapper.GetStats();
    }
}