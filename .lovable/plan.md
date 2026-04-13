

# خطة تحسين واجهات التطبيق + دعم التخزين السحابي على Google Drive

---

## المرحلة 1: تحسين الصفحة الرئيسية (Index.tsx)

- إعادة تصميم شاشة الترحيب بتخطيط أنظف وأكثر حداثة
- تحسين شاشات الـ Onboarding بانتقالات أكثر سلاسة وتصاميم أوضح
- إضافة إحصائية سريعة عند وجود أطفال (عدد صلوات اليوم الإجمالي)
- تحسين أزرار التنقل الرئيسية (الأطفال / لوحة التحكم) بتصميم cards بدل أزرار عادية

## المرحلة 2: تحسين صفحة اختيار الأطفال (KidSelection.tsx)

- إضافة إحصائيات سريعة في كل بطاقة طفل (نسبة صلوات اليوم، الشعلة الحالية)
- تأثير glow على بطاقة الطفل الذي أتم جميع صلواته
- تحسين الـ empty state بتصميم أكثر جاذبية وزر إضافة واضح
- ترتيب الأطفال حسب النشاط (الأنشط أولاً)

## المرحلة 3: تحسين صفحة تتبع الصلوات (KidTracker.tsx)

- تنظيم المكونات في sections واضحة مع فواصل بصرية
- تحسين header بعرض المستوى والشعلة والنجوم بتصميم أكثر تنظيماً
- إضافة skeleton loading عند تحميل البيانات
- تحسين تجربة السحب بين التواريخ بإشارات بصرية أوضح

## المرحلة 4: تحسين لوحة تحكم الوالدين (ParentDashboard.tsx)

- تحسين تصميم التابات بأيقونات ملونة ومؤشرات نشاط
- إضافة ملخص سريع (Dashboard Summary) في أعلى الصفحة
- تحسين تخطيط إدارة الأطفال بتصميم cards محسّن
- تحسين واجهة إضافة المكافآت والأنشطة

## المرحلة 5: تحسين متجر المكافآت (RewardShop.tsx)

- تصميم بطاقات المكافآت بتأثير glass-morphism
- إضافة فلترة (كوبونات / مكافآت)
- تحسين تجربة الشراء بتأكيد مرئي أفضل
- عرض سجل المشتريات بتصميم timeline

## المرحلة 6: تحسين صفحة الإنجازات (AchievementsScreen.tsx)

- تصميم الشارات بأسلوب 3D cards مع progress ring
- إضافة قسم "الإنجازات القريبة" يعرض ما يحتاجه الطفل للشارة التالية
- تحسين عرض الإحصائيات بتصميم بطاقات ملونة متجانسة

## المرحلة 7: دعم التخزين السحابي على Google Drive

### الفكرة
حفظ واستعادة بيانات التطبيق (JSON) على Google Drive كملف نسخة احتياطية، ليتمكن المستخدم من استرجاع بياناته على أي جهاز.

### التنفيذ
- **ربط Google Drive Connector**: استخدام نظام الـ connectors في Lovable لربط حساب Google Drive
- **إنشاء Edge Function** (`google-drive-sync`):
  - endpoint `POST /backup`: يرفع ملف JSON ببيانات التطبيق إلى مجلد خاص في Google Drive
  - endpoint `POST /restore`: يقرأ آخر نسخة احتياطية ويعيدها للتطبيق
  - endpoint `GET /list`: يعرض النسخ الاحتياطية المتاحة
- **واجهة المستخدم** في `ParentDashboard.tsx`:
  - زر "حفظ نسخة احتياطية على Google Drive" ☁️
  - زر "استعادة من Google Drive" 📥
  - عرض تاريخ آخر نسخة احتياطية
  - اختيار من بين النسخ المتاحة عند الاستعادة
- **مزامنة تلقائية** (اختيارية): حفظ تلقائي عند كل تغيير مهم (إضافة طفل، إتمام يوم كامل)

### المتطلبات
- تفعيل Lovable Cloud أولاً
- ربط Google Drive connector عبر `standard_connectors--connect`
- إنشاء Edge Function للتعامل مع Google Drive API عبر الـ gateway

---

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `src/pages/Index.tsx` | إعادة تصميم + إحصائيات سريعة |
| `src/pages/KidSelection.tsx` | إحصائيات البطاقات + glow + ترتيب |
| `src/pages/KidTracker.tsx` | تنظيم sections + skeleton loading |
| `src/pages/ParentDashboard.tsx` | dashboard summary + واجهة Google Drive |
| `src/pages/RewardShop.tsx` | glass cards + فلترة + timeline |
| `src/pages/AchievementsScreen.tsx` | 3D cards + progress rings |
| `src/index.css` | glass utilities + animations جديدة |
| `supabase/functions/google-drive-sync/index.ts` | **جديد** — Edge Function |

## ملاحظة مهمة حول Google Drive
لربط Google Drive، يجب أولاً تفعيل Lovable Cloud ثم ربط الـ connector. حالياً لا توجد أي connections في مساحة العمل. سأطلب ربط Google Drive عند بدء التنفيذ.

