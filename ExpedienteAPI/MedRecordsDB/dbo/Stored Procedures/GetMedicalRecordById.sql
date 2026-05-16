CREATE PROCEDURE dbo.GetMedicalRecordById
    @MedicalRecordId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.MedicalRecords
    WHERE MedicalRecordId = @MedicalRecordId;
END