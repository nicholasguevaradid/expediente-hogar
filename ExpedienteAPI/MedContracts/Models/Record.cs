using System;
using System.ComponentModel.DataAnnotations;

namespace MedContracts.Models
{
    public class MedicalRecordBase
    {
        [Required]
        public int PatientId { get; set; }

        [Required, DataType(DataType.Date)]
        public DateTime VisitDate { get; set; }

        [StringLength(120)]
        public string? LegalName { get; set; }

        [StringLength(300)]
        public string? Hist_Diagnosis { get; set; }

        [StringLength(300)]
        public string? Diagnosis { get; set; }

        [StringLength(100)]
        public string? Alergies { get; set; }

        [StringLength(300)]
        public string? Perscrption { get; set; }

        public string? Notes { get; set; }

        [Range(0, 300)]
        public decimal? HeightCm { get; set; }

        [Range(0, 1000)]
        public decimal? WeightKg { get; set; }

        [StringLength(20)]
        public string? BloodPressure { get; set; }

        [Range(25, 45)]
        public decimal? TemperatureC { get; set; }
    }

    public class MedicalRecordResponse : MedicalRecordBase
    {
        public int MedicalRecordId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}