
# خطة تطوير شاملة - متابع الصلاة للأطفال v1.0.0

## ما تم إنجازه ✅

### المرحلة 1: رسائل ترحيب + موسمية ديناميكية ✅
- ✅ إنشاء `src/lib/greetings.ts` مع `getGreeting()` (6 فترات) و `getSeasonalMessage()`
- ✅ كشف تلقائي لرمضان، العيدين، ليلة القدر، عشر ذي الحجة، المولد النبوي
- ✅ استبدال النص الثابت "إصدار رمضان ✨" بالرسائل الديناميكية في `Index.tsx`
- ✅ إضافة الرسائل في `KidSelection.tsx`

### المرحلة 2: تحسين UI/UX والتوافق ✅
- ✅ responsive grid في `KidSelection` (2-3 أعمدة حسب الشاشة)
- ✅ `max-w-sm sm:max-w-md` للشاشات الكبيرة
- ✅ font scaling للشاشات الصغيرة (`@media max-width: 360px`)
- ✅ تأثير صوتي للسحب بين الأطفال (`playSwipeSound`)

### المرحلة 3: أداء الهاتف والاستقرار ✅
- ✅ `ErrorBoundary` عام في `App.tsx`
- ✅ Lazy loading لجميع الصفحات (`React.lazy` + `Suspense`)
- ✅ `PageLoader` مع animation أثناء التحميل
- ✅ تقليل عدد الجسيمات تلقائياً حسب `navigator.hardwareConcurrency`
- ✅ `will-change-transform` على الجسيمات المتحركة
- ✅ `useMemo` لـ particles في `StarParticles`

### المرحلة 4: تنظيم المستودع والتوثيق ✅
- ✅ `CHANGELOG.md` — سجل التغييرات
- ✅ `CONTRIBUTING.md` — دليل المساهمة
- ✅ Version bump: `0.0.0` → `1.0.0`
- ✅ JSDoc comments على الدوال الجديدة

### البنية التحتية (سابقاً) ✅
- ✅ Capacitor + Haptics + Status Bar + Splash Screen
- ✅ PWA support + README.md
- ✅ إصلاح دقة التواريخ (`localDateStr` المركزي)
- ✅ التقويم الهجري (Intl.DateTimeFormat + أم القرى)
- ✅ إشعارات + تذكيرات ذكية
- ✅ PIN route guard + Zod validation
- ✅ وضع فاتح/داكن + أحجام لمس 44px + ARIA roles
