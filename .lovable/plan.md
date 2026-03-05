
# خطة تطوير شاملة - متابع الصلاة للأطفال

## ما تم إنجازه ✅

### البنية التحتية
- ✅ Capacitor setup + Haptics + Status Bar + Splash Screen
- ✅ README.md احترافي
- ✅ PWA support

### واجهة المستخدم
- ✅ تحسينات UI/UX (Onboarding, BottomNav, KidSelection, KidTracker)
- ✅ تحسين تصميم الشهادات (3 قوالب + تصدير PNG)
- ✅ وضع فاتح (Light Mode) مع زر تبديل شمس/قمر
- ✅ Particle burst عند الصلاة
- ✅ Skeleton loaders

### الإشعارات
- ✅ إشعارات Capacitor المحلية (تعمل في الخلفية على Native)
- ✅ Web fallback notifications
- ✅ تذكيرات ذكية (بعد ساعتين من الصلاة)
- ✅ تنبيه "Streak في خطر" الساعة 9 مساءً

### لوحة الوالدين
- ✅ رسم بياني مقارنة أداء الأطفال
- ✅ لوحة متصدرين عائلية
- ✅ تحديات أسبوعية تلقائية

### إمكانية الوصول
- ✅ aria-labels على العناصر الرئيسية
- ✅ أحجام لمس مناسبة (44px minimum)
- ✅ تباين ألوان محسّن في الوضع الفاتح

## الملفات الرئيسية

| الملف | الوصف |
|-------|-------|
| `src/lib/notifications.ts` | Capacitor Local Notifications wrapper |
| `src/lib/reminders.ts` | نظام التذكيرات (native + web fallback) |
| `src/components/ThemeToggle.tsx` | زر تبديل الوضع الفاتح/الداكن |
| `src/components/SkeletonLoader.tsx` | Skeleton + ParticleBurst |
| `src/components/ComparisonChart.tsx` | مقارنة أداء الأطفال |
| `src/components/Leaderboard.tsx` | لوحة متصدرين |
| `src/components/WeeklyChallenges.tsx` | تحديات أسبوعية |
| `src/components/CertificateGenerator.tsx` | شهادات إنجاز محسّنة |
