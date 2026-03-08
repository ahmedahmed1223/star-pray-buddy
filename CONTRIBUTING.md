# دليل المساهمة — Contributing Guide

## 🏗️ هيكلية المشروع

```
src/
├── components/     مكونات React
│   └── ui/         مكونات shadcn/ui
├── lib/            دوال مساعدة (store, hijri, sounds, greetings)
├── hooks/          React hooks مخصصة
├── pages/          صفحات التطبيق
└── assets/         صور وأيقونات
```

## 🚀 التشغيل المحلي

```bash
npm install
npm run dev
```

## 📐 معايير الكود

- **TypeScript** إلزامي لجميع الملفات
- **Tailwind CSS** مع design tokens من `index.css` — لا تستخدم ألوان مباشرة
- **framer-motion** للرسوم المتحركة
- اكتب **JSDoc** للدوال العامة
- حجم اللمس الأدنى **44px**
- دعم **RTL** — استخدم `rtl:` عند الحاجة

## 🧪 الاختبار

```bash
npm run test
```

## 📝 Commit Messages

استخدم صيغة [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` ميزة جديدة
- `fix:` إصلاح خطأ
- `docs:` توثيق
- `style:` تنسيق
- `refactor:` إعادة هيكلة
