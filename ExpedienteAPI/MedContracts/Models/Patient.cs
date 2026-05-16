using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MedContracts.Models
{
    public class PatientBase
    {
        [StringLength(30)]
        public string? Identificacion { get; set; }

        [Required, StringLength(60)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(60)]
        public string LastName { get; set; } = string.Empty;

        [StringLength(60)]
        public string? SecLastName { get; set; }

        [DataType(DataType.Date)]
        public DateTime? Birth_Date { get; set; }

        [StringLength(1)]
        public string? Gender { get; set; }

        [StringLength(25)]
        public string? PhoneNum { get; set; }

        [StringLength(25)]
        public string? EmergencyNum { get; set; }

        [StringLength(120)]
        public string? EmergencyName { get; set; }

        [EmailAddress, StringLength(120)]
        public string? Email { get; set; }

        [StringLength(120)]
        public string? AddressLine1 { get; set; }

        [StringLength(120)]
        public string? AddressLine2 { get; set; }

        [StringLength(80)]
        public string? Canton { get; set; }

        [StringLength(80)]
        public string? TipoCasa { get; set; }

        [StringLength(20)]
        public string Estado { get; set; } = "Activo";

        public string? Observaciones { get; set; }
    }

    public class PatientResponse : PatientBase
    {
        public int PatientId { get; set; }
        public string? NumeroExpediente { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PatientWithRecordsResponse
    {
        public PatientResponse Patient { get; set; } = new PatientResponse();
        public IEnumerable<MedicalRecordResponse> Records { get; set; } = Array.Empty<MedicalRecordResponse>();
    }
}