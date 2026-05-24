# 🤖 AI News Hub

**منصتك اليومية لأخبار الذكاء الاصطناعي، الشركات، الشخصيات المشهورة، والأفلام — بدقة 100%**

## 🌟 المميزات

- ✅ **4 أقسام رئيسية**: أخبار AI | الشركات | الشخصيات | الأفلام
- ✅ **تحديث تلقائي يومياً** عبر GitHub Actions (06:00 و 12:00 UTC)
- ✅ **مصادر موثوقة**: TechCrunch, Reuters, Reddit, Product Hunt + المواقع الرسمية
- ✅ **تصميم عصري** متجاوب مع جميع الأجهزة
- ✅ **مجاني 100%** على GitHub Pages

## 🚀 طريقة الرفع (خطوة بخطوة)

### 1️⃣ أنشئ مستودع على GitHub

```
الاسم: ai-news-hub
عام (Public)
```

### 2️⃣ ارفع الملفات

```bash
git init
git add .
git commit -m "🚀 AI News Hub - الإطلاق"
git branch -M main
git remote add origin https://github.com/أيوب/ai-news-hub.git
git push -u origin main
```

### 3️⃣ أضف Tavily API Key في Secrets

- اذهب إلى GitHub → Settings → Secrets and variables → Actions
- أضف secret باسم: `TAVILY_API_KEY`
- القيمة: `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`

### 4️⃣ فعّل GitHub Pages

- Settings → Pages
- Source: **Deploy from a branch**
- Branch: **main** → **/(root)**
- Save

### 5️⃣ شغّل أول تحديث

- Actions → Daily News Update → Run workflow
- بعد ما يخلص، افتح `https://أيوب.github.io/ai-news-hub/`

## 🏗️ هيكل المشروع

```
ai-news-hub/
├── index.html              # الصفحة الرئيسية
├── styles.css              # التصميم
├── scripts/
│   ├── app.js              # منطق الموقع (جلب وعرض الأخبار)
│   └── fetch-news.js       # سكريبت التحديث اليومي (Node.js)
├── data/
│   ├── news.json           # آخر الأخبار (يتم تحديثها تلقائياً)
│   └── .gitkeep
├── .github/workflows/
│   └── daily-news.yml      # GitHub Actions - تشغيل يومي
└── README.md
```

## 📡 المصادر المعتمدة

- TechCrunch
- Reuters
- Reddit (r/vibecoding, r/artificial, r/artificialintelligence)
- Product Hunt
- المواقع الرسمية (OpenAI, Google, Meta, Microsoft, Anthropic)
- IMDb & Rotten Tomatoes

## 🤝 المساهمة

أي اقتراح أو تحسين — مرحب بك تفتح Issue أو Pull Request!

## 📜 الترخيص

MIT - حر بالاستخدام والتعديل والنشر