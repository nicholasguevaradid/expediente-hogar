CREATE PROCEDURE [dbo].[GetStats]
AS
BEGIN
    SET NOCOUNT ON;

    -- Totales generales
    SELECT
        COUNT(*)                                                        AS TotalPatients,
        SUM(CASE WHEN Estado = 'Activo'   THEN 1 ELSE 0 END)           AS TotalActivo,
        SUM(CASE WHEN Estado = 'Inactivo' THEN 1 ELSE 0 END)           AS TotalInactivo,
        SUM(CASE WHEN Estado = 'Cerrado'  THEN 1 ELSE 0 END)           AS TotalCerrado,
        SUM(CASE WHEN Estado = 'Pendiente' THEN 1 ELSE 0 END)          AS TotalPendiente,
        SUM(CASE WHEN CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS NuevosHoy
    FROM dbo.Patients;

    -- Total de registros médicos
    SELECT COUNT(*) AS TotalRecords FROM dbo.MedicalRecords;

    -- Últimos 5 expedientes creados
    SELECT TOP 5
        PatientId,
        NumeroExpediente,
        FirstName,
        LastName,
        Estado,
        CreatedAt
    FROM dbo.Patients
    ORDER BY CreatedAt DESC;
END
