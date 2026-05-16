CREATE PROCEDURE [dbo].[GetUserByUsername]
    @Username NVARCHAR(60)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserId,
        Username,
        PasswordHash,
        Role,
        IsActive,
        CreatedAt
    FROM dbo.Users
    WHERE Username = @Username
      AND IsActive = 1;
END
