CREATE PROCEDURE dbo.GetPatientWithRecords
    @PatientId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.Patients
    WHERE PatientId = @PatientId;

    SELECT *
    FROM dbo.MedicalRecords
    WHERE PatientId = @PatientId
    ORDER BY VisitDate DESC, MedicalRecordId DESC;
END