CREATE TABLE [dbo].[MedicalRecords] (
    [MedicalRecordId] INT            IDENTITY (1, 1) NOT NULL,
    [PatientId]       INT            NOT NULL,
    [VisitDate]       DATE           NOT NULL,
    [LegalName]       VARCHAR (120)  NULL,
    [Hist_Diagnosis]  VARCHAR (300)  NULL,
    [Diagnosis]       VARCHAR (300)  NULL,
    [Alergies]        VARCHAR (100)  NULL,
    [Perscrption]     VARCHAR (300)  NULL,
    [Notes]           VARCHAR (MAX)  NULL,
    [HeightCm]        DECIMAL (5, 2) NULL,
    [WeightKg]        DECIMAL (5, 2) NULL,
    [BloodPressure]   VARCHAR (20)   NULL,
    [TemperatureC]    DECIMAL (4, 2) NULL,
    [CreatedAt]       DATETIME2 (0)  CONSTRAINT [DF_MedicalRecords_CreatedAt] DEFAULT (sysdatetime()) NOT NULL,
    [UpdatedAt]       DATETIME2 (0)  CONSTRAINT [DF_MedicalRecords_UpdatedAt] DEFAULT (sysdatetime()) NOT NULL,
    PRIMARY KEY CLUSTERED ([MedicalRecordId] ASC),
    CONSTRAINT [FK_MedicalRecords_Patients] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patients] ([PatientId]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_MedicalRecords_PatientId_VisitDate]
    ON [dbo].[MedicalRecords]([PatientId] ASC, [VisitDate] DESC);

