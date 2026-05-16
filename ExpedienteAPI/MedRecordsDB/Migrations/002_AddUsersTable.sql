-- Migration 002: Users table for authentication
-- Run once against an existing database that already has migration 001 applied.

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Users')
BEGIN
    CREATE TABLE [dbo].[Users]
    (
        [UserId]       INT            NOT NULL IDENTITY(1,1) PRIMARY KEY,
        [Username]     NVARCHAR(60)   NOT NULL,
        [PasswordHash] NVARCHAR(256)  NOT NULL,
        [Role]         NVARCHAR(30)   NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'Viewer',
        [IsActive]     BIT            NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
        [CreatedAt]    DATETIME2      NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_Users_Username UNIQUE ([Username])
    );
    PRINT 'Table Users created.';
END
ELSE
    PRINT 'Table Users already exists — skipped.';

-- GetUserByUsername
IF OBJECT_ID('dbo.GetUserByUsername', 'P') IS NOT NULL DROP PROCEDURE dbo.GetUserByUsername;
GO
CREATE PROCEDURE [dbo].[GetUserByUsername]
    @Username NVARCHAR(60)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, PasswordHash, Role, IsActive, CreatedAt
    FROM dbo.Users
    WHERE Username = @Username AND IsActive = 1;
END
GO

-- CreateUser
IF OBJECT_ID('dbo.CreateUser', 'P') IS NOT NULL DROP PROCEDURE dbo.CreateUser;
GO
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
GO
