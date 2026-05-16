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
