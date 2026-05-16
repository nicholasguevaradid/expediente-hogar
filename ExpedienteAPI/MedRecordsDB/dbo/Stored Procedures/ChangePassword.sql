CREATE PROCEDURE [dbo].[ChangePassword]
    @UserId       INT,
    @PasswordHash NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @UserId)
    BEGIN
        RAISERROR('Usuario no encontrado.', 16, 1);
        RETURN;
    END

    UPDATE dbo.Users
    SET PasswordHash = @PasswordHash
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
