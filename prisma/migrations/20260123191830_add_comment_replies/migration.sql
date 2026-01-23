BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[comments] ADD [parent_id] NVARCHAR(1000);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_parent_id_idx] ON [dbo].[comments]([parent_id]);

-- AddForeignKey
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_parent_id_fkey] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[comments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
