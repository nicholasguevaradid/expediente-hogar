using MedContracts.Models;

namespace MedContracts.Control_Interface.Flujo
{
    public interface IRecordFlujo
    {
        Task<MedicalRecordResponse?> GetMedicalRecordById(int medicalRecordId);
        Task<IEnumerable<MedicalRecordResponse>> ListMedicalRecordsByPatient(int patientId);

        Task<int> CreateMedicalRecord(MedicalRecordBase record);
        Task<int> UpdateMedicalRecord(int medicalRecordId, MedicalRecordBase record);
        Task<int> DeleteMedicalRecord(int medicalRecordId);
    }
}