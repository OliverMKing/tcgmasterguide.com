BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[announcements] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [active] BIT NOT NULL CONSTRAINT [announcements_active_df] DEFAULT 1,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [announcements_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [announcements_type_key] UNIQUE NONCLUSTERED ([type])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
