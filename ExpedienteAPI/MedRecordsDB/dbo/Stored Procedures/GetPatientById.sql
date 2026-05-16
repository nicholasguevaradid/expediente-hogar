CREATE PROCEDURE dbo.GetPatientById
    @PatientId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.Patients
    WHERE PatientId = @PatientId;
END