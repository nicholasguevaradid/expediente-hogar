CREATE PROCEDURE [dbo].[UpdateUser]
    @UserId   INT,
    @Role     NVARCHAR(30),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @UserId)
    BEGIN
        RAISERROR('Usuario no encontrado.', 16, 1);
        RETURN;
    END

    UPDATE dbo.Users
    SET Role     = @Role,
        IsActive = @IsActive
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
