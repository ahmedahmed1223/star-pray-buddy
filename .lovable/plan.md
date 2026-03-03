

# تحويل التطبيق لتطبيق Native باستخدام Capacitor + تحسين UI/UX

## 1. إعداد Capacitor

- تثبيت `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`
- تهيئة `capacitor.config.ts` مع:
  - `appId: "app.lovable.0206c376d9e840e08b31355a2abed913"`
  - `appName: "star-pray-buddy"`
  - إعداد server URL للـ hot-reload من الـ sandbox
- إضافة Capacitor plugins مفيدة: `@capacitor/haptics` (بدل `navigator.vibrate`), `@capacitor/status-bar`, `@capacitor/splash-screen`

## 2. تحسينات UI/UX للتجربة Native

### 2.1 Safe Area و Status Bar
- إضافة safe-area padding في `index.css` لدعم الأجهزة ذات النوتش (iPhone)
- ضبط ارتفاعات الـ BottomNav والـ headers لتتوافق مع الـ safe areas
- إضافة `viewport-fit=cover` في meta tag

### 2.2 تحسين الـ Haptics
- استبدال `navigator.vibrate` بـ Capacitor Haptics API للحصول على ردود فعل لمسية أفضل على iOS
- إضافة haptic feedback مخصص لكل نوع تفاعل (نقر خفيف للصلاة، متوسط للشارة، قوي للترقية)

### 2.3 تحسين Status Bar
- ضبط لون الـ Status Bar ليتوافق مع خلفية التطبيق الداكنة
- إخفاء الـ Status Bar أو جعله شفافاً في الشاشة الرئيسية

### 2.4 Splash Screen
- تكوين splash screen مع شعار التطبيق وخلفية ليلية

### 2.5 تحسينات بصرية إضافية
- تكبير أزرار العودة والتنقل لتكون 48px minimum
- إضافة smooth scrolling و overscroll behavior مناسب للـ native
- تحسين الانتقالات بين الصفحات لتشبه تطبيقات iOS/Android
- إزالة أي tap highlight colors
- تعطيل text selection على العناصر غير النصية

## 3. الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `package.json` | إضافة Capacitor dependencies |
| `capacitor.config.ts` | ملف جديد - إعداد Capacitor |
| `index.html` | viewport-fit=cover + safe area meta |
| `src/index.css` | safe area padding + native polish |
| `src/lib/haptics.ts` | ملف جديد - Haptics wrapper |
| `src/pages/KidTracker.tsx` | استخدام haptics بدل vibrate |
| `src/components/BottomNav.tsx` | safe area bottom padding |
| `src/components/InstallPrompt.tsx` | إخفاء على native platforms |

## 4. خطوات المستخدم بعد التنفيذ

بعد تنفيذ التغييرات:
1. نقل المشروع لـ GitHub عبر "Export to Github"
2. `git pull` ثم `npm install`
3. `npx cap add ios` و/أو `npx cap add android`
4. `npx cap update ios/android`
5. `npm run build` ثم `npx cap sync`
6. `npx cap run ios` (يحتاج Mac + Xcode) أو `npx cap run android` (يحتاج Android Studio)

