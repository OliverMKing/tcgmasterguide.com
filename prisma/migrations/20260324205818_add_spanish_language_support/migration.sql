BEGIN TRY

BEGIN TRAN;

-- Note: Skipping DROP CONSTRAINT for users_stripe_customer_id_key and
-- users_stripe_subscription_id_key as these constraints don't exist in production

-- AlterTable
ALTER TABLE [dbo].[comments] ADD [locale] NVARCHAR(1000) NOT NULL CONSTRAINT [comments_locale_df] DEFAULT 'en';

-- AlterTable
ALTER TABLE [dbo].[users] ADD [stripe_subscription_id_es] NVARCHAR(1000),
[stripe_subscription_status_es] NVARCHAR(1000),
[subscription_ends_at_es] DATETIME2;

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_locale_idx] ON [dbo].[comments]([locale]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
