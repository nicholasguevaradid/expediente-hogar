using ClosedXML.Excel;
using MedContracts.Control_Interface.Flujo;
using MedContracts.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ExpedienteAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Produces("application/json")]
    [Tags("Export")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly IPatientFlujo _patientFlujo;
        private readonly IRecordFlujo  _recordFlujo;

        public ExportController(IPatientFlujo patientFlujo, IRecordFlujo recordFlujo)
        {
            _patientFlujo = patientFlujo;
            _recordFlujo  = recordFlujo;
        }

        // GET /api/patients/{id}/export/pdf
        [HttpGet("patients/{patientId:int}/export/pdf")]
        [Produces("application/pdf")]
        public async Task<IActionResult> ExportPdf([FromRoute] int patientId)
        {
            var data = await _patientFlujo.GetPatientWithRecords(patientId);
            if (data is null)
                return NotFound(new { message = "Paciente no encontrado.", status = 404, timestamp = DateTime.UtcNow });

            var pdf = BuildPdf(data);
            var filename = $"expediente-{data.Patient.NumeroExpediente ?? patientId.ToString()}.pdf";
            return File(pdf, "application/pdf", filename);
        }

        // GET /api/patients/export/excel?search=&estado=
        [HttpGet("patients/export/excel")]
        [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] string? search = null,
            [FromQuery] string? estado = null)
        {
            var patients = await _patientFlujo.ExportPatients(search, estado);
            var excel    = BuildExcel(patients);
            return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "expedientes.xlsx");
        }

        // GET /api/records/{recordId}/export/pdf
        [HttpGet("records/{recordId:int}/export/pdf")]
        [Produces("application/pdf")]
        public async Task<IActionResult> ExportRecordPdf([FromRoute] int recordId)
        {
            var record = await _recordFlujo.GetMedicalRecordById(recordId);
            if (record is null)
                return NotFound(new { message = "Registro médico no encontrado.", status = 404, timestamp = DateTime.UtcNow });

            var patient = await _patientFlujo.GetPatientById(record.PatientId);
            if (patient is null)
                return NotFound(new { message = "Paciente no encontrado.", status = 404, timestamp = DateTime.UtcNow });

            var data = new PatientWithRecordsResponse { Patient = patient, Records = new[] { record } };
            var pdf  = BuildPdf(data);
            var date = record.VisitDate?.ToString("yyyyMMdd") ?? "sin-fecha";
            return File(pdf, "application/pdf", $"registro-{recordId}-{date}.pdf");
        }

        // GET /api/records/{recordId}/export/excel
        [HttpGet("records/{recordId:int}/export/excel")]
        [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
        public async Task<IActionResult> ExportRecordExcel([FromRoute] int recordId)
        {
            var record = await _recordFlujo.GetMedicalRecordById(recordId);
            if (record is null)
                return NotFound(new { message = "Registro médico no encontrado.", status = 404, timestamp = DateTime.UtcNow });

            var patient = await _patientFlujo.GetPatientById(record.PatientId);
            if (patient is null)
                return NotFound(new { message = "Paciente no encontrado.", status = 404, timestamp = DateTime.UtcNow });

            var excel = BuildRecordExcel(patient, record);
            var date  = record.VisitDate?.ToString("yyyyMMdd") ?? "sin-fecha";
            return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"registro-{recordId}-{date}.xlsx");
        }

        // ── PDF ────────────────────────────────────────────────────────────────
        private static byte[] BuildPdf(PatientWithRecordsResponse data)
        {
            var p  = data.Patient;
            var rs = data.Records.OrderByDescending(r => r.VisitDate).ToList();

            return Document.Create(doc =>
            {
                doc.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.MarginHorizontal(1.8f, Unit.Centimetre);
                    page.MarginVertical(1.5f, Unit.Centimetre);
                    page.DefaultTextStyle(t => t.FontSize(9).FontFamily("Arial"));

                    // ── Header
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(inner =>
                            {
                                inner.Item().Text("EXPEDIENTE HOGAR")
                                    .Bold().FontSize(16).FontColor("#1d4ed8");
                                inner.Item().Text("Sistema de gestión de expedientes")
                                    .FontSize(8).FontColor("#6b7280");
                            });
                            row.AutoItem().Column(inner =>
                            {
                                inner.Item().AlignRight().Text(p.NumeroExpediente ?? "—")
                                    .Bold().FontSize(13).FontColor("#1d4ed8");
                                inner.Item().AlignRight()
                                    .Text($"Generado: {DateTime.Now:dd/MM/yyyy HH:mm}")
                                    .FontSize(8).FontColor("#6b7280");
                            });
                        });
                        col.Item().PaddingTop(6).LineHorizontal(1).LineColor("#e5e7eb");
                    });

                    // ── Footer
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Página ").FontSize(8).FontColor("#9ca3af");
                        x.CurrentPageNumber().FontSize(8).FontColor("#9ca3af");
                        x.Span(" de ").FontSize(8).FontColor("#9ca3af");
                        x.TotalPages().FontSize(8).FontColor("#9ca3af");
                    });

                    // ── Content
                    page.Content().PaddingTop(10).Column(col =>
                    {
                        // Patient header
                        col.Item().Background("#eff6ff").Padding(10).Column(inner =>
                        {
                            inner.Item().Text($"{p.LastName}, {p.FirstName}{(p.SecLastName is not null ? " " + p.SecLastName : "")}")
                                .Bold().FontSize(14).FontColor("#1e3a8a");
                            inner.Item().PaddingTop(2).Row(row =>
                            {
                                row.AutoItem().Text($"Estado: {p.Estado}").FontSize(8).FontColor("#374151");
                                row.AutoItem().PaddingLeft(12).Text($"Identificación: {p.Identificacion ?? "—"}").FontSize(8).FontColor("#374151");
                            });
                        });

                        col.Item().PaddingTop(12).Text("DATOS PERSONALES")
                            .Bold().FontSize(9).FontColor("#374151").LetterSpacing(0.05f);
                        col.Item().PaddingTop(4).LineHorizontal(0.5f).LineColor("#d1d5db");
                        col.Item().PaddingTop(6).Grid(grid =>
                        {
                            grid.Columns(3);
                            grid.Spacing(6);
                            void Field(string label, string? value)
                            {
                                if (string.IsNullOrWhiteSpace(value)) return;
                                grid.Item().Column(c =>
                                {
                                    c.Item().Text(label).FontSize(7).FontColor("#6b7280");
                                    c.Item().Text(value).FontSize(9);
                                });
                            }
                            Field("Fecha de nacimiento", p.Birth_Date?.ToString("dd/MM/yyyy"));
                            Field("Género",  p.Gender == "M" ? "Masculino" : p.Gender == "F" ? "Femenino" : p.Gender);
                            Field("Teléfono", p.PhoneNum);
                            Field("Correo electrónico", p.Email);
                            Field("Cantón", p.Canton);
                            Field("Dirección", p.AddressLine1);
                            Field("Dirección (línea 2)", p.AddressLine2);
                            Field("Tipo de casa", p.TipoCasa);
                            Field("Tel. emergencia", p.EmergencyNum);
                            Field("Contacto emergencia", p.EmergencyName);
                        });

                        if (!string.IsNullOrWhiteSpace(p.Observaciones))
                        {
                            col.Item().PaddingTop(8).Column(inner =>
                            {
                                inner.Item().Text("Observaciones").FontSize(7).FontColor("#6b7280");
                                inner.Item().Text(p.Observaciones).FontSize(9);
                            });
                        }

                        // Medical records
                        col.Item().PaddingTop(16).Text($"REGISTROS MÉDICOS ({rs.Count})")
                            .Bold().FontSize(9).FontColor("#374151").LetterSpacing(0.05f);
                        col.Item().PaddingTop(4).LineHorizontal(0.5f).LineColor("#d1d5db");

                        if (rs.Count == 0)
                        {
                            col.Item().PaddingTop(8).Text("Sin registros médicos.")
                                .FontSize(9).FontColor("#9ca3af").Italic();
                        }
                        else
                        {
                            foreach (var rec in rs)
                            {
                                col.Item().PaddingTop(10).Border(0.5f).BorderColor("#e5e7eb").Padding(8).Column(inner =>
                                {
                                    inner.Item().Text($"Visita: {rec.VisitDate:dd/MM/yyyy}")
                                        .Bold().FontSize(9).FontColor("#1d4ed8");
                                    inner.Item().PaddingTop(4).Grid(grid =>
                                    {
                                        grid.Columns(2);
                                        grid.Spacing(5);
                                        void Rec(string label, string? value)
                                        {
                                            if (string.IsNullOrWhiteSpace(value)) return;
                                            grid.Item().Column(c =>
                                            {
                                                c.Item().Text(label).FontSize(7).FontColor("#6b7280");
                                                c.Item().Text(value).FontSize(9);
                                            });
                                        }
                                        Rec("Diagnóstico", rec.Diagnosis);
                                        Rec("Diagnóstico histórico", rec.Hist_Diagnosis);
                                        Rec("Alergias", rec.Alergies);
                                        Rec("Prescripción", rec.Perscrption);
                                        Rec("Presión arterial", rec.BloodPressure);
                                        Rec("Temperatura (°C)", rec.TemperatureC?.ToString("F1"));
                                        Rec("Peso (kg)", rec.WeightKg?.ToString("F1"));
                                        Rec("Altura (cm)", rec.HeightCm?.ToString());
                                    });
                                    if (!string.IsNullOrWhiteSpace(rec.Notes))
                                    {
                                        inner.Item().PaddingTop(5).Column(c =>
                                        {
                                            c.Item().Text("Notas").FontSize(7).FontColor("#6b7280");
                                            c.Item().Text(rec.Notes).FontSize(9);
                                        });
                                    }
                                });
                            }
                        }
                    });
                });
            }).GeneratePdf();
        }

        // ── Excel ──────────────────────────────────────────────────────────────
        private static byte[] BuildExcel(IEnumerable<PatientResponse> patients)
        {
            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Expedientes");

            // Headers
            string[] headers =
            [
                "N° Expediente", "Identificación", "Apellidos", "Nombre",
                "Fecha Nacimiento", "Género", "Estado",
                "Teléfono", "Correo", "Cantón", "Dirección",
                "Tel. Emergencia", "Contacto Emergencia",
                "Fecha Registro", "Última Actualización"
            ];

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1d4ed8");
                cell.Style.Font.FontColor       = XLColor.White;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            // Rows
            int row = 2;
            foreach (var p in patients)
            {
                ws.Cell(row, 1).Value  = p.NumeroExpediente ?? "";
                ws.Cell(row, 2).Value  = p.Identificacion ?? "";
                ws.Cell(row, 3).Value  = $"{p.LastName}{(p.SecLastName is not null ? " " + p.SecLastName : "")}";
                ws.Cell(row, 4).Value  = p.FirstName;
                ws.Cell(row, 5).Value  = p.Birth_Date.HasValue ? p.Birth_Date.Value.ToString("dd/MM/yyyy") : "";
                ws.Cell(row, 6).Value  = p.Gender == "M" ? "Masculino" : p.Gender == "F" ? "Femenino" : (p.Gender ?? "");
                ws.Cell(row, 7).Value  = p.Estado;
                ws.Cell(row, 8).Value  = p.PhoneNum ?? "";
                ws.Cell(row, 9).Value  = p.Email ?? "";
                ws.Cell(row, 10).Value = p.Canton ?? "";
                ws.Cell(row, 11).Value = p.AddressLine1 ?? "";
                ws.Cell(row, 12).Value = p.EmergencyNum ?? "";
                ws.Cell(row, 13).Value = p.EmergencyName ?? "";
                ws.Cell(row, 14).Value = p.CreatedAt.ToString("dd/MM/yyyy HH:mm");
                ws.Cell(row, 15).Value = p.UpdatedAt.ToString("dd/MM/yyyy HH:mm");

                // Alternate row color
                if (row % 2 == 0)
                    ws.Row(row).Style.Fill.BackgroundColor = XLColor.FromHtml("#f0f9ff");

                row++;
            }

            ws.Columns().AdjustToContents();
            ws.SheetView.FreezeRows(1);

            using var stream = new MemoryStream();
            wb.SaveAs(stream);
            return stream.ToArray();
        }

        private static byte[] BuildRecordExcel(PatientResponse p, MedicalRecordResponse rec)
        {
            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Registro Médico");

            void Header(IXLCell cell, string text)
            {
                cell.Value = text;
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1d4ed8");
                cell.Style.Font.FontColor = XLColor.White;
            }

            // Patient section
            ws.Cell(1, 1).Value = "DATOS DEL PACIENTE";
            ws.Cell(1, 1).Style.Font.Bold = true;
            ws.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#eff6ff");

            string[,] patientFields =
            {
                { "N° Expediente",       p.NumeroExpediente ?? "" },
                { "Identificación",      p.Identificacion ?? "" },
                { "Apellidos",           $"{p.LastName}{(p.SecLastName is not null ? " " + p.SecLastName : "")}" },
                { "Nombre",              p.FirstName },
                { "Fecha de nacimiento", p.Birth_Date.HasValue ? p.Birth_Date.Value.ToString("dd/MM/yyyy") : "" },
                { "Género",              p.Gender == "M" ? "Masculino" : p.Gender == "F" ? "Femenino" : (p.Gender ?? "") },
                { "Estado",              p.Estado },
            };

            for (int i = 0; i < patientFields.GetLength(0); i++)
            {
                ws.Cell(i + 2, 1).Value = patientFields[i, 0];
                ws.Cell(i + 2, 1).Style.Font.Bold = true;
                ws.Cell(i + 2, 2).Value = patientFields[i, 1];
            }

            int recRow = patientFields.GetLength(0) + 4;

            // Record section headers
            string[] recHeaders =
            [
                "ID Registro", "Fecha de visita", "Diagnóstico", "Diagnóstico histórico",
                "Alergias", "Prescripción", "Presión arterial",
                "Temperatura (°C)", "Peso (kg)", "Altura (cm)", "Notas"
            ];
            for (int i = 0; i < recHeaders.Length; i++) Header(ws.Cell(recRow, i + 1), recHeaders[i]);

            // Record data row
            int dr = recRow + 1;
            ws.Cell(dr, 1).Value  = rec.MedicalRecordId;
            ws.Cell(dr, 2).Value  = rec.VisitDate.HasValue ? rec.VisitDate.Value.ToString("dd/MM/yyyy") : "";
            ws.Cell(dr, 3).Value  = rec.Diagnosis ?? "";
            ws.Cell(dr, 4).Value  = rec.Hist_Diagnosis ?? "";
            ws.Cell(dr, 5).Value  = rec.Alergies ?? "";
            ws.Cell(dr, 6).Value  = rec.Perscrption ?? "";
            ws.Cell(dr, 7).Value  = rec.BloodPressure ?? "";
            ws.Cell(dr, 8).Value  = rec.TemperatureC.HasValue ? (double)rec.TemperatureC.Value : (object)"";
            ws.Cell(dr, 9).Value  = rec.WeightKg.HasValue     ? (double)rec.WeightKg.Value     : (object)"";
            ws.Cell(dr, 10).Value = rec.HeightCm.HasValue     ? (double)rec.HeightCm.Value     : (object)"";
            ws.Cell(dr, 11).Value = rec.Notes ?? "";

            ws.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            wb.SaveAs(stream);
            return stream.ToArray();
        }
    }
}
