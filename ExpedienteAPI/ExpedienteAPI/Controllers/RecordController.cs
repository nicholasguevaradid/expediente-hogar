using MedContracts.Control_Interface.Flujo;
using MedContracts.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpedienteAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Produces("application/json")]
    [Tags("Medical Records")]
    [Authorize]
    public class MedicalRecordController : ControllerBase
    {
        private readonly IRecordFlujo _recordFlujo;

        public MedicalRecordController(IRecordFlujo recordFlujo)
        {
            _recordFlujo = recordFlujo;
        }

        // GET: /api/records/5
        [HttpGet("records/{medicalRecordId:int}")]
        [ProducesResponseType(typeof(MedicalRecordResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MedicalRecordResponse>> GetById([FromRoute] int medicalRecordId)
        {
            var record = await _recordFlujo.GetMedicalRecordById(medicalRecordId);
            if (record is null) return NotFound(ApiError(404, "Registro médico no encontrado."));

            return Ok(record);
        }

        // POST: /api/patients/5/records
        [HttpPost("patients/{patientId:int}/records")]
        [Authorize(Roles = "Admin")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateForPatient([FromRoute] int patientId, [FromBody] MedicalRecordBase request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            request.PatientId = patientId;

            try
            {
                var newId = await _recordFlujo.CreateMedicalRecord(request);
                return CreatedAtAction(
                    nameof(GetById),
                    new { medicalRecordId = newId },
                    new { medicalRecordId = newId }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        // PUT: /api/records/5
        [HttpPut("records/{medicalRecordId:int}")]
        [Authorize(Roles = "Admin")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] int medicalRecordId, [FromBody] MedicalRecordBase request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var rows = await _recordFlujo.UpdateMedicalRecord(medicalRecordId, request);
                if (rows <= 0) return NotFound(ApiError(404, "Registro médico no encontrado."));

                return Ok(new { updated = rows });
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        // DELETE: /api/records/5
        [HttpDelete("records/{medicalRecordId:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] int medicalRecordId)
        {
            try
            {
                var rows = await _recordFlujo.DeleteMedicalRecord(medicalRecordId);
                if (rows <= 0) return NotFound(ApiError(404, "Registro médico no encontrado."));

                return Ok(new { deleted = rows });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiError(500, ex.Message));
            }
        }

        private static object ApiError(int status, string message) => new
        {
            message,
            status,
            timestamp = DateTime.UtcNow
        };
    }
}