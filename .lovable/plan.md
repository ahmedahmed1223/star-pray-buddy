

# خطة تطوير شاملة - متابع الصلاة للأطفال

## ما تم إنجازه حتى الآن
- Capacitor setup + Haptics + Status Bar + Splash Screen
- README.md احترافي
- تحسينات UI/UX (Onboarding, BottomNav, KidSelection, KidTracker)
- تحسين تصميم الشهادات (3 قوالب + تصدير PNG)
- نظام تذكيرات أساسي (يعتمد على `setInterval` - يحتاج التطبيق مفتوحاً)

## المراحل المتبقية

---

### المرحلة 1: إشعارات Capacitor المحلية (أولوية عالية)

**المشكلة:** نظام التذكيرات الحالي في `src/lib/reminders.ts` يستخدم `setInterval` + `new Notification()` ويتطلب بقاء التطبيق مفتوحاً.

**الحل:**
- تثبيت `@capacitor/local-notifications`
- إنشاء `src/lib/notifications.ts`:
  - على Native: استخدام `LocalNotifications.schedule()` لجدولة إشعارات حقيقية تعمل في الخلفية
  - على الويب: الإبقاء على النظام الحالي كـ fallback
- جدولة 5 إشعارات يومية متكررة (صلاة) + إشعار Streak الساعة 9 مساءً + تذكيرات ذكية
- تحديث `ReminderSettings.tsx` و `reminders.ts` لاستخدام النظام الجديد

| الملف | التغيير |
|-------|---------|
| `package.json` | إضافة `@capacitor/local-notifications` |
| `src/lib/notifications.ts` | ملف جديد - wrapper للإشعارات المحلية |
| `src/lib/reminders.ts` | استخدام notifications.ts بدل setInterval |
| `src/components/ReminderSettings.tsx` | تحديث لدعم النظام الجديد |

---

### المرحلة 2: وضع فاتح (Light Mode) (أولوية عالية)

- إضافة متغيرات CSS تحت `.light` في `index.css` بألوان فاتحة
- إنشاء `src/components/ThemeToggle.tsx` مع أيقونة شمس/قمر
- حفظ التفضيل في localStorage
- إضافة الزر في Index.tsx و ParentDashboard.tsx

| الملف | التغيير |
|-------|---------|
| `src/index.css` | متغيرات Light theme |
| `src/components/ThemeToggle.tsx` | جديد |
| `src/pages/Index.tsx` | زر التبديل |
| `src/pages/ParentDashboard.tsx` | زر التبديل |

---

### المرحلة 3: تحسينات UX متقدمة (أولوية متوسطة)

- **Pull-to-refresh** في KidTracker باستخدام touch gesture
- **Skeleton loading** screens عند تحميل البيانات
- **انتقالات slide** (يمين/يسار) عند التنقل بين الأطفال
- **Particle burst** عند الضغط على زر الصلاة

| الملف | التغيير |
|-------|---------|
| `src/pages/KidTracker.tsx` | pull-to-refresh + particle burst |
| `src/components/SkeletonLoader.tsx` | جديد |

---

### المرحلة 4: تحسينات لوحة الوالدين (أولوية متوسطة)

- رسم بياني مقارنة أداء الأطفال جنباً إلى جنب
- تصدير تقرير شهري كصورة
- تخصيص أوقات الصلاة ورسائل التحفيز

| الملف | التغيير |
|-------|---------|
| `src/pages/ParentDashboard.tsx` | مقارنة + إعدادات متقدمة |
| `src/components/ComparisonChart.tsx` | جديد |

---

### المرحلة 5: ميزات اجتماعية وتنافسية (أولوية منخفضة)

- لوحة متصدرين عائلية (ترتيب بالنجوم/Streak)
- تحديات أسبوعية تلقائية (مثل: صلاة الفجر 7 أيام)
- قوالب شهادات إضافية

| الملف | التغيير |
|-------|---------|
| `src/components/Leaderboard.tsx` | جديد |
| `src/components/WeeklyChallenges.tsx` | جديد |

---

### المرحلة 6: إمكانية الوصول والتدويل (أولوية منخفضة)

- دعم اللغة الإنجليزية (i18n بسيط)
- تحسين التباين وأحجام الخطوط
- إضافة aria-labels

---

## ملخص الأولويات

| المرحلة | الوصف | الأولوية |
|---------|-------|----------|
| 1 | إشعارات Capacitor المحلية | عالية |
| 2 | وضع فاتح (Light Mode) | عالية |
| 3 | تحسينات UX متقدمة | متوسطة |
| 4 | تحسينات لوحة الوالدين | متوسطة |
| 5 | ميزات اجتماعية وتنافسية | منخفضة |
| 6 | إمكانية الوصول والتدويل | منخفضة |

**التوصية:** تنفيذ المرحلتين 1 و 2 معاً كونهما الأعلى أولوية وتأثيراً على تجربة المستخدم.

