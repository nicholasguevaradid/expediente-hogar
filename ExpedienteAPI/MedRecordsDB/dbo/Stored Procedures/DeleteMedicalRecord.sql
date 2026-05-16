CREATE PROCEDURE dbo.DeleteMedicalRecord
    @MedicalRecordId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.MedicalRecords
    WHERE MedicalRecordId = @MedicalRecordId;

    SELECT @@ROWCOUNT AS RowsAffected;
END