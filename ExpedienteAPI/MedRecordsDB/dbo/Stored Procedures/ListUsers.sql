CREATE PROCEDURE [dbo].[ListUsers]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserId,
        Username,
        Role,
        IsActive,
        CreatedAt
    FROM dbo.Users
    ORDER BY CreatedAt DESC;
END
