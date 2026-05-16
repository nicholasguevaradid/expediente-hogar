using MedContracts.Control_Interface.Flujo;
using MedContracts.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpedienteAPI.Controllers
{
    [ApiController]
    [Route("api/stats")]
    [Produces("application/json")]
    [Tags("Stats")]
    [Authorize]
    public class StatsController : ControllerBase
    {
        private readonly IPatientFlujo _patientFlujo;

        public StatsController(IPatientFlujo patientFlujo)
        {
            _patientFlujo = patientFlujo;
        }

        // GET /api/stats
        [HttpGet]
        [ProducesResponseType(typeof(StatsResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            var stats = await _patientFlujo.GetStats();
            return Ok(stats);
        }
    }
}
