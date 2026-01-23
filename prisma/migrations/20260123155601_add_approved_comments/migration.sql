BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[comments] ADD [approved] BIT NOT NULL CONSTRAINT [comments_approved_df] DEFAULT 0;

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_approved_idx] ON [dbo].[comments]([approved]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
