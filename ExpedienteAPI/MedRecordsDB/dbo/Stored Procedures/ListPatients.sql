CREATE PROCEDURE dbo.ListPatients
    @Search   VARCHAR(120) = NULL,
    @Estado   VARCHAR(20)  = NULL,
    @Page     INT          = 1,
    @PageSize INT          = 20
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: total de registros que coinciden (para calcular páginas)
    SELECT COUNT(*) AS Total
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
        );

    -- Result 2: página solicitada
    SELECT *
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
    ORDER BY LastName, FirstName
    OFFSET (@Page - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END