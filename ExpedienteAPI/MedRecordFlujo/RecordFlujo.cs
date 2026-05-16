using MedContracts.Control_Interface.Flujo;
using MedContracts.Control_Interface.RepoDapper;
using MedContracts.Models;

namespace MedRecordFlujo
{
    public class RecordFlujo : IRecordFlujo
    {
        private readonly IRecordDapper _recordDapper;

        public RecordFlujo(IRecordDapper recordDapper)
        {
            _recordDapper = recordDapper;
        }

        public Task<MedicalRecordResponse?> GetMedicalRecordById(int medicalRecordId)
            => _recordDapper.GetMedicalRecordById(medicalRecordId);

        public Task<IEnumerable<MedicalRecordResponse>> ListMedicalRecordsByPatient(int patientId)
            => _recordDapper.ListMedicalRecordsByPatient(patientId);

        public Task<int> CreateMedicalRecord(MedicalRecordBase record)
            => _recordDapper.CreateMedicalRecord(record);

        public Task<int> UpdateMedicalRecord(int medicalRecordId, MedicalRecordBase record)
            => _recordDapper.UpdateMedicalRecord(medicalRecordId, record);

        public Task<int> DeleteMedicalRecord(int medicalRecordId)
            => _recordDapper.DeleteMedicalRecord(medicalRecordId);
    }
}