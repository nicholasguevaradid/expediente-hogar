CREATE PROCEDURE dbo.ListPatients
    @Search VARCHAR(120) = NULL,
    @Estado VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (200) *
    FROM dbo.Patients
    WHERE
        (@Estado IS NULL OR Estado = @Estado)
        AND (
            @Search IS NULL
            OR NumeroExpediente LIKE '%' + @Search + '%'
            OR Identificacion   LIKE '%' + @Search + '%'
            OR FirstName        LIKE '%' + @Search + '%'
            OR LastName         LIKE '%' + @Search + '%'
            OR SecLastName      LIKE '%' + @Search + '%'
            OR Email            LIKE '%' + @Search + '%'
            OR PhoneNum         LIKE '%' + @Search + '%'
            OR Canton           LIKE '%' + @Search + '%'
        )
    ORDER BY LastName, FirstName;
END