-- Migration 001: Add expediente fields to Patients table
-- Run this script ONLY if the database already exists.
-- For a fresh setup, use the .sqlproj deployment instead.

USE MedRecordsDB;
GO

-- Add NumeroExpediente
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Patients') AND name = 'NumeroExpediente'
)
BEGIN
    ALTER TABLE dbo.Patients ADD [NumeroExpediente] VARCHAR(30) NULL;
    PRINT 'Column NumeroExpediente added.';
END
GO

-- Unique constraint on NumeroExpediente
IF NOT EXISTS (
    SELECT 1 FROM sys.key_constraints
    WHERE name = 'UQ_Patients_NumeroExpediente' AND parent_object_id = OBJECT_ID('dbo.Patients')
)
BEGIN
    ALTER TABLE dbo.Patients
        ADD CONSTRAINT [UQ_Patients_NumeroExpediente] UNIQUE ([NumeroExpediente]);
    PRINT 'Unique constraint UQ_Patients_NumeroExpediente added.';
END
GO

-- Add Identificacion
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Patients') AND name = 'Identificacion'
)
BEGIN
    ALTER TABLE dbo.Patients ADD [Identificacion] VARCHAR(30) NULL;
    PRINT 'Column Identificacion added.';
END
GO

-- Add Estado
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Patients') AND name = 'Estado'
)
BEGIN
    ALTER TABLE dbo.Patients
        ADD [Estado] VARCHAR(20) NOT NULL
            CONSTRAINT [DF_Patients_Estado] DEFAULT ('Activo');
    PRINT 'Column Estado added.';
END
GO

-- Add Observaciones
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Patients') AND name = 'Observaciones'
)
BEGIN
    ALTER TABLE dbo.Patients ADD [Observaciones] NVARCHAR(MAX) NULL;
    PRINT 'Column Observaciones added.';
END
GO

-- Populate NumeroExpediente for existing rows that don't have one
UPDATE dbo.Patients
SET NumeroExpediente = 'EXP-' + FORMAT(CreatedAt, 'yyyy') + '-' + RIGHT('000000' + CAST(PatientId AS VARCHAR(10)), 6)
WHERE NumeroExpediente IS NULL;
PRINT 'NumeroExpediente populated for existing rows.';
GO

PRINT 'Migration 001 completed successfully.';
GO
