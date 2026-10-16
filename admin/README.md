# پنل مدیریت Anivora

آدرس بعد از دیپلوی: `https://anivora.pages.dev/admin/`

## راه‌اندازی (یک‌بار)

1. **افزودن ستون‌های جدید به دیتابیس** (کارگردان، نویسنده، استودیو):
   ```
   npx wrangler d1 execute anivora-db --remote --file=migrations/001_admin_fields.sql
   ```
2. (رمز ندارد) هر کسی آدرس `/admin/` را بداند می‌تواند ویرایش و حذف کند.
3. پروژه را روی GitHub پوش کنید تا Cloudflare Pages دیپلوی کند، و `/admin/` را باز کنید.

## نکات

- فقط روی همان دیتابیس D1 کار می‌کند؛ تغییرات پنل بلافاصله روی `anivora.pages.dev` دیده می‌شود.
- نسخه‌ی GitHub Pages از `data.json` می‌خواند که هر ۳۰ دقیقه توسط GitHub Action از API ساخته می‌شود.
  برای آپدیت فوری: GitHub ← Actions ← Update data.json ← Run workflow.
- **`import-data.sql` و `schema.sql` همه‌ی جدول‌ها را DROP می‌کنند.** بعد از شروع کار با پنل، آن‌ها را دوباره اجرا نکنید وگرنه تغییرات پنل پاک می‌شود.
- تصاویر به‌صورت لینک ذخیره می‌شوند (آپلود فایل ندارد).
