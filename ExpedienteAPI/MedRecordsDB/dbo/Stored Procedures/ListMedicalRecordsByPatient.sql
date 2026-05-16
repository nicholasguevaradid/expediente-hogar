CREATE PROCEDURE dbo.ListMedicalRecordsByPatient
    @PatientId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.MedicalRecords
    WHERE PatientId = @PatientId
    ORDER BY VisitDate DESC, MedicalRecordId DESC;
END