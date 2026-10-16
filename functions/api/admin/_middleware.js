// بدون رمز: هر کسی که آدرس /admin را داشته باشد می‌تواند ویرایش کند.
import { json } from '../../_shared/admin.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return context.next();
  try {
    return await context.next();
  } catch (e) {
    return json({ error: e.message || 'خطای داخلی' }, 500);
  }
}
