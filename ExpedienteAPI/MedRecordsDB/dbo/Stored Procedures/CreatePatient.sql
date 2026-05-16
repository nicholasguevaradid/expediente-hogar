CREATE PROCEDURE dbo.CreatePatient
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
        SELECT 1 FROM dbo.Patients WHERE Identificacion = @Identificacion
    )
    BEGIN
        RAISERROR('La identificación ya está registrada.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.Patients
    (
        Identificacion, FirstName, LastName, SecLastName, Birth_Date, Gender,
        PhoneNum, EmergencyNum, EmergencyName, Email,
        AddressLine1, AddressLine2, Canton, TipoCasa, Estado, Observaciones
    )
    VALUES
    (
        @Identificacion, @FirstName, @LastName, @SecLastName, @Birth_Date, @Gender,
        @PhoneNum, @EmergencyNum, @EmergencyName, @Email,
        @AddressLine1, @AddressLine2, @Canton, @TipoCasa, @Estado, @Observaciones
    );

    DECLARE @NewId INT = SCOPE_IDENTITY();

    UPDATE dbo.Patients
    SET NumeroExpediente = 'EXP-' + FORMAT(GETDATE(), 'yyyy') + '-' + RIGHT('000000' + CAST(@NewId AS VARCHAR(10)), 6)
    WHERE PatientId = @NewId;

    SELECT @NewId AS PatientId;
END