BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[users] DROP CONSTRAINT [users_stripe_customer_id_key];

-- DropIndex
ALTER TABLE [dbo].[users] DROP CONSTRAINT [users_stripe_subscription_id_key];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
