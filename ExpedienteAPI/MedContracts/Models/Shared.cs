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
}
