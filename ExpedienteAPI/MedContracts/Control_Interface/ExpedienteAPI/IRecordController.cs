using MedContracts.Models;
using Microsoft.AspNetCore.Mvc;

namespace MedContracts.Control_Interface.ExpedienteAPI
{
    public interface IRecordController
    {
        Task<IActionResult> GetById(int medicalRecordId);
        Task<IActionResult> ListByPatient(int patientId);
        Task<IActionResult> Create(MedicalRecordBase request);
        Task<IActionResult> Update(int medicalRecordId, MedicalRecordBase request);
        Task<IActionResult> Delete(int medicalRecordId);
    }
}