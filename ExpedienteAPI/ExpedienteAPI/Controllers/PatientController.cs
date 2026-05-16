using MedContracts.Control_Interface.Flujo;
using MedContracts.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpedienteAPI.Controllers
{
    [ApiController]
    [Route("api/patients")]
    [Produces("application/json")]
    [Tags("Patients")]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly IPatientFlujo _patientFlujo;

        public PatientController(IPatientFlujo patientFlujo)
        {
            _patientFlujo = patientFlujo;
        }

        // GET: /api/patients?search=ana&estado=Activo&page=1&pageSize=20
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResult<PatientResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResult<PatientResponse>>> List(
            [FromQuery] string? search   = null,
            [FromQuery] string? estado   = null,
            [FromQuery] int     page     = 1,
            [FromQuery] int     pageSize = 20)
        {
            if (page < 1)     page     = 1;
            if (pageSize < 1) pageSize = 1;
            if (pageSize > 100) pageSize = 100;

            var result = await _patientFlujo.ListPatients(search, estado, page, pageSize);
            return Ok(result);
        }

        // GET: /api/patients/5
        [HttpGet("{patientId:int}")]
        [ProducesResponseType(typeof(PatientResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PatientResponse>> GetById([FromRoute] int patientId)
        {
            var patient = await _patientFlujo.GetPatientById(patientId);
            if (patient is null) return NotFound(ApiError(404, "Paciente no encontrado."));

            return Ok(patient);
        }

        // GET: /api/patients/5/records (más limpio que "with-records")
        [HttpGet("{patientId:int}/records")]
        [ProducesResponseType(typeof(PatientWithRecordsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PatientWithRecordsResponse>> GetWithRecords([FromRoute] int patientId)
        {
            var result = await _patientFlujo.GetPatientWithRecords(patientId);
            if (result is null) return NotFound(ApiError(404, "Paciente no encontrado."));

            return Ok(result);
        }

        // POST: /api/patients
        [HttpPost]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] PatientBase request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var newId = await _patientFlujo.CreatePatient(request);

            return CreatedAtAction(
                nameof(GetById),
                new { patientId = newId },
                new { patientId = newId }
            );
        }

        // PUT: /api/patients/5
        [HttpPut("{patientId:int}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] int patientId, [FromBody] PatientBase request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var rows = await _patientFlujo.UpdatePatient(patientId, request);
                if (rows <= 0) return NotFound(ApiError(404, "Paciente no encontrado."));

                return Ok(new { updated = rows });
            }
            catch (Exception ex)
            {
                return BadRequest(ApiError(400, ex.Message));
            }
        }

        // DELETE: /api/patients/5
        [HttpDelete("{patientId:int}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] int patientId)
        {
            try
            {
                var rows = await _patientFlujo.DeletePatient(patientId);
                if (rows <= 0) return NotFound(ApiError(404, "Paciente no encontrado."));

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