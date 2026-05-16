CREATE PROCEDURE dbo.UpdatePatient
    @PatientId       INT,
    @Identificacion  VARCHAR(30) = NULL,
    @FirstName       VARCHAR(60),
    @LastName        VARCHAR(60),
    @SecLastName     VARCHAR(60) = NULL,
    @Birth_Date      DATE = NULL,
    @Gender          VARCHAR(1) = NULL,
    @PhoneNum        VARCHAR(25) = NULL,
    @EmergencyNum    VARCHAR(25) = NULL,
    @EmergencyName   VARCHAR(120) = NULL,
    @Email           VARCHAR(120) = NULL,
    @AddressLine1    VARCHAR(120) = NULL,
    @AddressLine2    VARCHAR(120) = NULL,
    @Canton          VARCHAR(80) = NULL,
    @TipoCasa        VARCHAR(80) = NULL,
    @Estado          VARCHAR(20) = 'Activo',
    @Observaciones   NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Identificacion IS NOT NULL AND EXISTS (
        SELECT 1 FROM dbo.Patients
        WHERE Identificacion = @Identificacion AND PatientId <> @PatientId
    )
    BEGIN
        RAISERROR('La identificación ya está registrada en otro expediente.', 16, 1);
        RETURN;
    END

    UPDATE dbo.Patients
    SET
        Identificacion = @Identificacion,
        FirstName = @FirstName,
        LastName = @LastName,
        SecLastName = @SecLastName,
        Birth_Date = @Birth_Date,
        Gender = @Gender,
        PhoneNum = @PhoneNum,
        EmergencyNum = @EmergencyNum,
        EmergencyName = @EmergencyName,
        Email = @Email,
        AddressLine1 = @AddressLine1,
        AddressLine2 = @AddressLine2,
        Canton = @Canton,
        TipoCasa = @TipoCasa,
        Estado = @Estado,
        Observaciones = @Observaciones,
        UpdatedAt = SYSDATETIME()
    WHERE PatientId = @PatientId;

    SELECT @@ROWCOUNT AS RowsAffected;
END