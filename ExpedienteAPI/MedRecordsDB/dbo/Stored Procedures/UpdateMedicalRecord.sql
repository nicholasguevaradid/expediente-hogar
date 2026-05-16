CREATE PROCEDURE dbo.UpdateMedicalRecord
    @MedicalRecordId  INT,
    @VisitDate        DATE,
    @LegalName        VARCHAR(120) = NULL,
    @Hist_Diagnosis   VARCHAR(300) = NULL,
    @Diagnosis        VARCHAR(300) = NULL,
    @Alergies         VARCHAR(100) = NULL,
    @Perscrption      VARCHAR(300) = NULL,
    @Notes            VARCHAR(MAX) = NULL,
    @HeightCm         DECIMAL(5,2) = NULL,
    @WeightKg         DECIMAL(5,2) = NULL,
    @BloodPressure    VARCHAR(20) = NULL,
    @TemperatureC     DECIMAL(4,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.MedicalRecords
    SET
        VisitDate = @VisitDate,
        LegalName = @LegalName,
        Hist_Diagnosis = @Hist_Diagnosis,
        Diagnosis = @Diagnosis,
        Alergies = @Alergies,
        Perscrption = @Perscrption,
        Notes = @Notes,
        HeightCm = @HeightCm,
        WeightKg = @WeightKg,
        BloodPressure = @BloodPressure,
        TemperatureC = @TemperatureC,
        UpdatedAt = SYSDATETIME()
    WHERE MedicalRecordId = @MedicalRecordId;

    SELECT @@ROWCOUNT AS RowsAffected;
END