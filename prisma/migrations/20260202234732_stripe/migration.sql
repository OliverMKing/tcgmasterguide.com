/*
  Warnings:

  - A unique constraint covering the columns `[stripe_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[users] ADD [stripe_customer_id] NVARCHAR(1000),
[stripe_subscription_id] NVARCHAR(1000),
[stripe_subscription_status] NVARCHAR(1000),
[subscription_ends_at] DATETIME2;

-- CreateIndex
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_stripe_customer_id_key] UNIQUE NONCLUSTERED ([stripe_customer_id]);

-- CreateIndex
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_stripe_subscription_id_key] UNIQUE NONCLUSTERED ([stripe_subscription_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
