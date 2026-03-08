

# خطة تطوير شاملة - متابع الصلاة للأطفال

## تحليل الوضع الحالي

بعد مراجعة الكود، لاحظت التالي:
- **رسالة الترحيب** موجودة فعلاً في `getGreeting()` بـ `Index.tsx` (4 فترات: ليل، صباح، ظهر، مساء) لكنها تظهر فقط في الصفحة الرئيسية وليس في باقي الصفحات
- **الرسائل الموسمية** غير موجودة — النص "إصدار رمضان ✨" ثابت دائماً ولا يتغير حسب التقويم الهجري
- **التقويم الهجري** (`hijri.ts`) يدعم `Intl.DateTimeFormat` مع أم القرى ويمكن استخدامه لكشف شهر رمضان تلقائياً
- **التصميم** جيد لكن يحتاج تحسينات في التنقل والتوافق مع الشاشات الكبيرة

---

## المرحلة 1: تخصيص رسائل الترحيب والرسائل الموسمية (أولوية عالية)

### 1.1 تحسين رسالة الترحيب حسب الوقت
- نقل `getGreeting()` إلى ملف مشترك `src/lib/greetings.ts` ليُستخدم في عدة صفحات
- إضافة رسائل أدق (6 فترات بدل 4): فجر، صباح، ظهر، عصر، مغرب، عشاء
- عرض الرسالة في `KidSelection.tsx` و `KidTracker.tsx` أيضاً

### 1.2 رسائل موسمية تلقائية حسب التقويم الهجري
- إنشاء دالة `getSeasonalMessage()` في `src/lib/greetings.ts` تستخدم `toHijri()` من `hijri.ts`
- كشف شهر رمضان تلقائياً (month === 9) وعرض "رمضان كريم 🌙"
- كشف العيدين: شوال 1 (عيد الفطر)، ذو الحجة 10 (عيد الأضحى)
- كشف مناسبات أخرى: ليلة القدر (رمضان 27)، عشر ذي الحجة، المولد النبوي
- استبدال النص الثابت "إصدار رمضان ✨" بالرسالة الموسمية الديناميكية في `Index.tsx`
- تغيير الزخارف والألوان حسب المناسبة (فوانيس في رمضان، نجوم في العيد)

| الملف | التغيير |
|-------|---------|
| `src/lib/greetings.ts` | جديد — `getGreeting()` + `getSeasonalMessage()` + `getSeasonalTheme()` |
| `src/lib/hijri.ts` | إضافة `isRamadan()`, `isEid()`, `getCurrentSeason()` |
| `src/pages/Index.tsx` | استخدام الرسائل الديناميكية بدل النص الثابت |
| `src/pages/KidSelection.tsx` | إضافة رسالة الترحيب |
| `src/pages/KidTracker.tsx` | إضافة رسالة الترحيب |

---

## المرحلة 2: تحسين واجهة المستخدم وتجربة المستخدم (أولوية عالية)

### 2.1 تحسين التنقل
- إضافة **breadcrumb** خفيف أعلى الصفحات الداخلية (الرئيسية > الطفل > الصلوات)
- تحسين زر الرجوع ليعرض اسم الصفحة السابقة
- إضافة **gesture hints** (إشارات بصرية) تدل على إمكانية السحب بين الأطفال

### 2.2 توافق الشاشات المختلفة
- إضافة `max-w-lg` و responsive breakpoints للشاشات الكبيرة (tablet/desktop)
- تحسين grid layout في `KidSelection` ليعرض 2-3 أعمدة على الشاشات الأكبر
- إضافة `@media` queries لتحسين أحجام الخطوط على الشاشات الصغيرة جداً

### 2.3 تحسينات بصرية
- إضافة **micro-animations** عند التبديل بين التابات في `BottomNav`
- تحسين حالة الفراغ (empty state) في `KidSelection` بتصميم أكثر جاذبية
- إضافة **loading transitions** سلسة عند التنقل بين الصفحات

| الملف | التغيير |
|-------|---------|
| `src/index.css` | responsive utilities + font scaling |
| `src/pages/KidSelection.tsx` | responsive grid + gesture hints |
| `src/components/BottomNav.tsx` | تحسين animations |
| `src/App.tsx` | تحسين page transitions |

---

## المرحلة 3: تحسين أداء تطبيقات الهاتف (أولوية متوسطة)

### 3.1 تحسين الأداء
- تطبيق `React.memo` على المكونات الثقيلة (`PrayerButton`, `WeeklyCalendar`, `LanternProgress`)
- تطبيق `useMemo` و `useCallback` لتقليل إعادة الرندر غير الضرورية
- تأجيل تحميل المكونات غير المرئية (lazy loading) باستخدام `React.lazy` + `Suspense`

### 3.2 تقليل استهلاك الموارد
- تحسين `StarParticles` لتقليل عدد الجسيمات على الأجهزة الضعيفة (باستخدام `navigator.hardwareConcurrency`)
- إضافة `will-change` CSS للعناصر المتحركة لتحسين GPU rendering
- تحسين حجم الصور (`ramadan-bg.jpg`) بإضافة نسخ مختلفة الأحجام

### 3.3 استقرار وخلو من الأخطاء
- إضافة `ErrorBoundary` عام يلتقط الأخطاء ويعرض رسالة ودية
- تحسين معالجة حالات `null/undefined` في `getChild()` و `getDateLog()`

| الملف | التغيير |
|-------|---------|
| `src/components/StarParticles.tsx` | adaptive particle count |
| `src/App.tsx` | lazy loading + ErrorBoundary |
| `src/pages/KidTracker.tsx` | React.memo + useMemo optimizations |
| `src/components/ErrorBoundary.tsx` | جديد |

---

## المرحلة 4: تنظيم المستودع والتوثيق (أولوية متوسطة)

### 4.1 تنظيم هيكلية المشروع
- إعادة تنظيم المجلدات:
```text
src/
├── components/
│   ├── ui/          (مكونات shadcn الأساسية)
│   ├── prayer/      (PrayerButton, LanternProgress, WeeklyCalendar)
│   ├── gamification/(Confetti, Leaderboard, WeeklyChallenges, CertificateGenerator)
│   └── layout/      (BottomNav, ThemeToggle, DateNavigator)
├── lib/             (store, hijri, sounds, haptics, notifications, greetings)
├── hooks/           (use-mobile, use-toast)
├── pages/           (Index, KidTracker, ParentDashboard, etc.)
└── assets/          (images, avatars)
```

### 4.2 توثيق الكود
- تحديث `README.md` بدليل التثبيت والتشغيل والبنية المعمارية
- إضافة JSDoc comments للدوال الرئيسية في `store.ts`, `hijri.ts`, `notifications.ts`
- إنشاء `CONTRIBUTING.md` بمعايير الكود وطريقة المساهمة
- إنشاء `CHANGELOG.md` لتتبع الإصدارات

### 4.3 إدارة الإصدارات
- تحديث `package.json` بنظام semantic versioning (حالياً الإصدار 0.1.0 → 1.0.0)
- توثيق التغييرات في كل إصدار

| الملف | التغيير |
|-------|---------|
| `README.md` | تحديث شامل |
| `CONTRIBUTING.md` | جديد |
| `CHANGELOG.md` | جديد |
| `package.json` | version bump |
| Multiple files | JSDoc comments |

---

## ملخص الأولويات

| المرحلة | الوصف | الأولوية | التأثير |
|---------|-------|----------|---------|
| 1 | رسائل ترحيب + موسمية ديناميكية | عالية | تفاعل المستخدم |
| 2 | تحسين UI/UX والتنقل | عالية | تجربة المستخدم |
| 3 | أداء الهاتف والاستقرار | متوسطة | جودة التطبيق |
| 4 | تنظيم المستودع والتوثيق | متوسطة | صيانة الكود |

