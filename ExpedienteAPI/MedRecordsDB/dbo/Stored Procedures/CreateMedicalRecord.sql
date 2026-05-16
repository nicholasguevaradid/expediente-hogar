CREATE PROCEDURE dbo.CreateMedicalRecord
    @PatientId        INT,
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

    IF NOT EXISTS (SELECT 1 FROM dbo.Patients WHERE PatientId = @PatientId)
    BEGIN
        RAISERROR('PatientId does not exist.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.MedicalRecords
    (
        PatientId, VisitDate, LegalName, Hist_Diagnosis, Diagnosis,
        Alergies, Perscrption, Notes,
        HeightCm, WeightKg, BloodPressure, TemperatureC
    )
    VALUES
    (
        @PatientId, @VisitDate, @LegalName, @Hist_Diagnosis, @Diagnosis,
        @Alergies, @Perscrption, @Notes,
        @HeightCm, @WeightKg, @BloodPressure, @TemperatureC
    );

    SELECT SCOPE_IDENTITY() AS MedicalRecordId;
END