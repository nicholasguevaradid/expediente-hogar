using MedContracts.Models;
using Microsoft.AspNetCore.Mvc;

namespace MedContracts.Control_Interface.ExpedienteAPI
{
    public interface IPatientController
    {
        Task<IActionResult> List(string? search = null);
        Task<IActionResult> GetById(int patientId);
        Task<IActionResult> GetWithRecords(int patientId);
        Task<IActionResult> Create(PatientBase request);
        Task<IActionResult> Update(int patientId, PatientBase request);
        Task<IActionResult> Delete(int patientId);
    }
}