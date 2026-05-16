namespace MedContracts.Models
{
    public class PaginatedResult<T>
    {
        public IEnumerable<T> Data { get; set; } = Array.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
    }

    public class StatsResponse
    {
        public int TotalPatients { get; set; }
        public int TotalActivo { get; set; }
        public int TotalInactivo { get; set; }
        public int TotalCerrado { get; set; }
        public int TotalPendiente { get; set; }
        public int NuevosHoy { get; set; }
        public int TotalRecords { get; set; }
        public IEnumerable<RecentPatient> RecentPatients { get; set; } = Array.Empty<RecentPatient>();
    }

    public class RecentPatient
    {
        public int PatientId { get; set; }
        public string? NumeroExpediente { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
