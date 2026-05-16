CREATE PROCEDURE [dbo].[CreateUser]
    @Username     NVARCHAR(60),
    @PasswordHash NVARCHAR(256),
    @Role         NVARCHAR(30) = 'Viewer'
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.Users WHERE Username = @Username)
    BEGIN
        RAISERROR('El nombre de usuario ya está en uso.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.Users (Username, PasswordHash, Role)
    VALUES (@Username, @PasswordHash, @Role);

    SELECT SCOPE_IDENTITY() AS UserId;
END
