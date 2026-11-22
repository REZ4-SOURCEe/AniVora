/* ============================================
   ANIVORA — I18N (فارسی)
   ترجمهٔ مقادیر داده، اعداد فارسی و ابزارهای bidi
   نکته: نام انیمه، کارگردان، نویسنده و استودیو ترجمه نمی‌شوند.
============================================ */

const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

/** تبدیل اعداد لاتین به فارسی (رشته یا عدد). اعشار → «٫» */
export function fa(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/\d/g, d => FA_DIGITS[+d])
    .replace(/(\d|[۰-۹])\.(?=[۰-۹])/g, '$1٫');
}

/** escape برای قرار دادن متن داخل HTML */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/** متن لاتین/ژاپنی (اسم انیمه و...) را ایزوله می‌کند تا علائم نگارشی در متن راست‌چین جابه‌جا نشوند */
export function bdi(s) {
  return `<bdi>${esc(s)}</bdi>`;
}

/* ---------- ژانر ---------- */
const GENRES = {
  'action': 'اکشن', 'adventure': 'ماجراجویی', 'comedy': 'کمدی', 'drama': 'درام',
  'fantasy': 'فانتزی', 'horror': 'ترسناک', 'mystery': 'معمایی', 'psychological': 'روان‌شناختی',
  'romance': 'عاشقانه', 'sci-fi': 'علمی‌تخیلی', 'slice of life': 'برشی از زندگی',
  'sports': 'ورزشی', 'sport': 'ورزشی', 'supernatural': 'ماورائی', 'thriller': 'هیجان‌انگیز',
  'medical': 'پزشکی', 'historical': 'تاریخی', 'military': 'نظامی', 'mecha': 'مکا',
  'magic': 'جادویی', 'school': 'مدرسه‌ای', 'music': 'موسیقایی', 'ecchi': 'اکچی',
  'harem': 'هارم', 'isekai': 'ایسکای', 'martial arts': 'هنرهای رزمی', 'game': 'بازی',
  'demons': 'شیاطین', 'vampire': 'خون‌آشام', 'superpower': 'ابرقدرت', 'shounen': 'شونن',
  'shoujo': 'شوجو', 'seinen': 'سینن', 'josei': 'جوسی', 'kids': 'کودکانه', 'parody': 'پارودی',
  'police': 'پلیسی', 'samurai': 'سامورایی', 'space': 'فضایی', 'cars': 'ماشین', 'food': 'غذا',
  'gore': 'خشن', 'crime': 'جنایی', 'war': 'جنگی', 'family': 'خانوادگی', 'animation': 'انیمیشن'
};

/** پاک‌سازی ژانر (مثلاً "Drama," با ویرگول اضافه در دیتا) */
export function cleanGenre(g) {
  return String(g ?? '').replace(/[,،;؛\s]+$/g, '').replace(/^[,،;؛\s]+/g, '').trim();
}

export function tGenre(g) {
  const c = cleanGenre(g);
  return GENRES[c.toLowerCase()] || c;
}

/* ---------- وضعیت پخش ---------- */
const STATUS = { 'airing': 'در حال پخش', 'finished': 'پایان‌یافته', 'upcoming': 'به‌زودی', 'completed': 'پایان‌یافته', 'ongoing': 'در حال پخش' };
export function tStatus(s) { return STATUS[String(s ?? '').toLowerCase()] || s || ''; }

/* ---------- نوع ---------- */
const TYPES = { 'tv': 'سریال', 'movie': 'فیلم', 'ova': 'OVA', 'ona': 'ONA', 'special': 'ویژه' };
export function tType(t) { return TYPES[String(t ?? '').toLowerCase()] || t || ''; }

/* ---------- وضعیت لیست کاربر ---------- */
const LIST_STATUS = {
  watching: 'در حال تماشا',
  completed: 'تکمیل‌شده',
  plan_to_watch: 'برنامه برای تماشا',
  not_watched: 'تماشا نشده'
};
export function tListStatus(s) { return LIST_STATUS[s] || ''; }

/* ---------- فصل / قسمت / مدت ---------- */
export function seasonTitle(season) {
  const n = season?.seasonNumber ?? 1;
  const t = season?.title;
  if (!t || /^season\s*\d+$/i.test(String(t).trim())) return `فصل ${fa(n)}`;
  return t;
}

export function epTitle(ep) {
  const t = ep?.title;
  if (!t || /^(episode|ep\.?)\s*\d+$/i.test(String(t).trim())) return `قسمت ${fa(ep?.num ?? '')}`;
  return t;
}

/** "24 min" → "۲۴ دقیقه" | "24:00" → "۲۴:۰۰" */
export function tDuration(d) {
  if (!d) return fa('24') + ' دقیقه';
  const s = String(d).trim();
  const m = s.match(/^(\d+)\s*(min|mins|minutes?)\.?$/i);
  if (m) return `${fa(m[1])} دقیقه`;
  const h = s.match(/^(\d+)\s*(h|hr|hrs|hours?)\.?(?:\s*(\d+)\s*(?:min|m)\.?)?$/i);
  if (h) return `${fa(h[1])} ساعت` + (h[3] ? ` و ${fa(h[3])} دقیقه` : '');
  return fa(s);
}

/** استودیو: فقط مقدار «Unknown» جایگزین می‌شود، نام استودیوها دست‌نخورده می‌ماند */
export function tStudio(s) {
  if (!s || /^unknown$/i.test(String(s).trim())) return 'نامشخص';
  return s;
}

/* ---------- زمان ---------- */
export function fmtDays(totalHours) {
  const h = Math.max(0, Math.floor(totalHours));
  if (h > 24) {
    const d = Math.floor(h / 24);
    const r = h % 24;
    return r ? `${fa(d)} روز و ${fa(r)} ساعت` : `${fa(d)} روز`;
  }
  return `${fa(h)} ساعت`;
}

export function fmtMinutes(minutes) {
  if (!minutes || minutes <= 0 || isNaN(minutes)) return `${fa(0)} دقیقه`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${fa(m)} دقیقه`;
  if (m === 0) return `${fa(h)} ساعت`;
  return `${fa(h)} ساعت و ${fa(m)} دقیقه`;
}

/** زمان پلیر: 00:00 با ارقام فارسی */
export function faTime(str) { return fa(str); }

/* ---------- روزهای هفته (هفته از شنبه) ---------- */
export const WEEK_ORDER = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const WEEKDAYS_FA = {
  Saturday: 'شنبه', Sunday: 'یکشنبه', Monday: 'دوشنبه', Tuesday: 'سه‌شنبه',
  Wednesday: 'چهارشنبه', Thursday: 'پنجشنبه', Friday: 'جمعه'
};
export function todayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
}

/* ---------- زبان زیرنویس ---------- */
const LANGS = { fa: 'فارسی', en: 'انگلیسی', ar: 'عربی', tr: 'ترکی', ja: 'ژاپنی', ko: 'کره‌ای', fr: 'فرانسوی', de: 'آلمانی', es: 'اسپانیایی', ru: 'روسی' };
const LANG_BY_LABEL = { persian: 'فارسی', farsi: 'فارسی', english: 'انگلیسی', arabic: 'عربی', turkish: 'ترکی', japanese: 'ژاپنی' };
export function tSubLabel(sub) {
  const byLabel = LANG_BY_LABEL[String(sub?.label ?? '').trim().toLowerCase()];
  return byLabel || LANGS[String(sub?.lang ?? '').toLowerCase()] || sub?.label || 'زیرنویس';
}

/* ---------- پیام‌های خطای سرور ---------- */
const ERRORS = {
  'invalid email': 'ایمیل واردشده معتبر نیست.',
  'password must be at least 6 characters': 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
  'this email is already registered': 'این ایمیل قبلاً ثبت‌نام کرده است.',
  'email and password required': 'ایمیل و رمز عبور را وارد کنید.',
  'invalid email or password': 'ایمیل یا رمز عبور اشتباه است.',
  'unauthorized': 'دسترسی غیرمجاز. دوباره وارد شوید.',
  'user not found': 'کاربر پیدا نشد.',
  'animeid required': 'شناسهٔ انیمه ارسال نشده است.',
  'not found': 'مورد درخواستی پیدا نشد.',
  'internal error': 'خطای داخلی سرور. کمی بعد دوباره تلاش کنید.',
  'network error. please check your connection.': 'خطا در اتصال به شبکه. اینترنت خود را بررسی کنید.'
};
export function tError(msg) {
  const key = String(msg ?? '').trim().toLowerCase();
  if (ERRORS[key]) return ERRORS[key];
  if (/^http \d+$/i.test(key)) return `خطای سرور (${fa(key.replace(/\D/g, ''))})`;
  if (/username/i.test(key)) return 'نام کاربری معتبر نیست.';
  return msg || 'مشکلی پیش آمد. دوباره تلاش کنید.';
}
