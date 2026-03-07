

# خطة التنفيذ: إصلاح دقة التواريخ + المراحل المتبقية

## المرحلة 1: إصلاح دقة التواريخ (حرجة)

### 1.1 إنشاء `localDateStr` في `src/lib/store.ts`
- إضافة دالة مركزية `localDateStr(d?: Date)` تستخدم `getFullYear/getMonth/getDate` بدل `toISOString()`
- تصديرها واستبدال `todayStr()` و `dateToKey()` بها
- تحديث `getWeeklyLogs` و `getMonthlyLogs` لاستخدامها

### 1.2 تحديث الملفات المستهلكة
استبدال كل `toISOString().split('T')[0]` بـ `localDateStr()`:
- `src/pages/KidTracker.tsx` (سطر 47-48)
- `src/pages/ParentDashboard.tsx` (سطر 127، 149)
- `src/components/WeeklyChallenges.tsx` (أسطر 27، 44، 65)
- `src/components/MonthlyChart.tsx` (سطر 19)
- `src/lib/reminders.ts` (أسطر 101، 116)

### 1.3 إصلاح التقويم الهجري في `src/lib/hijri.ts`
- استبدال الخوارزمية الرياضية التقريبية بـ `Intl.DateTimeFormat` مع تقويم أم القرى (`ar-SA-u-ca-islamic-umalqura`)
- استخدام `formatToParts` لاستخراج اليوم والشهر والسنة بدقة
- الإبقاء على نفس الواجهة (`toHijri` و `formatHijri`)

---

## المرحلة 2: تحسينات UX إضافية

### 2.1 انتقالات Slide بين الأطفال
- إضافة دعم swipe يمين/يسار في `KidTracker.tsx` باستخدام Framer Motion drag
- عند السحب، الانتقال لصفحة الطفل التالي/السابق في القائمة

### 2.2 تأثيرات صوتية إضافية
- إضافة أصوات في `src/lib/sounds.ts` للتفاعلات الإضافية (slide، badge)

---

## المرحلة 3: تحسينات لوحة الوالدين

### 3.1 تصدير تقرير شهري كصورة PNG
- إضافة زر تصدير في `ReportView.tsx` يستخدم `html2canvas`-style approach (Canvas API) لتحويل التقرير لصورة

### 3.2 إحصائيات تفصيلية لكل صلاة
- إضافة مكون يعرض أقوى وأضعف صلاة لكل طفل باستخدام `getPrayerAnalysis` الموجود أصلاً

---

## المرحلة 4: إمكانية الوصول

### 4.1 تحسين aria-labels وأحجام الخطوط
- مراجعة وتحسين الـ accessibility في المكونات الرئيسية

---

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `src/lib/store.ts` | إضافة `localDateStr` + استبدال 4 مواقع |
| `src/lib/hijri.ts` | إعادة كتابة بـ `Intl.DateTimeFormat` |
| `src/pages/KidTracker.tsx` | استبدال 2 موقع + إضافة swipe |
| `src/pages/ParentDashboard.tsx` | استبدال 2 موقع + تصدير تقرير PNG |
| `src/components/WeeklyChallenges.tsx` | استبدال 3 مواقع |
| `src/components/MonthlyChart.tsx` | استبدال 1 موقع |
| `src/lib/reminders.ts` | استبدال 2 موقع |
| `src/components/ReportView.tsx` | إحصائيات تفصيلية + تصدير PNG |

