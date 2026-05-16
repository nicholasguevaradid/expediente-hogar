CREATE PROCEDURE dbo.DeletePatient
    @PatientId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Patients
    WHERE PatientId = @PatientId;

    SELECT @@ROWCOUNT AS RowsAffected;
END