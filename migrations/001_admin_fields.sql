-- اجرا فقط یک بار روی دیتابیس موجود:
--   npx wrangler d1 execute anivora-db --remote --file=migrations/001_admin_fields.sql
ALTER TABLE anime ADD COLUMN studio TEXT;
ALTER TABLE anime ADD COLUMN director TEXT;
ALTER TABLE anime ADD COLUMN writer TEXT;
