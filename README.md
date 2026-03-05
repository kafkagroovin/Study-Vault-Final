# StudyVault 📚

Your AI-powered student productivity app. Works on any phone, tablet, or desktop — no account needed.

## ✨ Features
- ⏱ Study Timer (Pomodoro / Short / Free mode)
- 💸 Money Tracker with budget
- 📝 Rich Notes with AI tools (quiz, flashcards, summarize, etc.)
- 🤖 AI Chat (StudyBot)
- 🎨 6 Theme templates
- 🔥 Study streak tracker

## 🤖 AI Setup (Free — No credit card)
1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with Google → Create API key (it's free)
3. Open the app → **Me tab → Settings → Paste your key**
4. That's it! AI features work instantly.

> Your API key is stored only on your own device (localStorage). It never leaves your browser.

---

## 🚀 Deploy to Vercel (5 minutes)

### Option A — GitHub + Vercel (recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "StudyVault initial"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/studyvault.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to **https://vercel.com** → Sign up free
   - Click **"Add New Project"**
   - Import your GitHub repo
   - Vercel auto-detects React → click **Deploy**
   - Done! You get a live URL like `studyvault.vercel.app`

### Option B — Vercel CLI

```bash
npm install -g vercel
npm install
vercel
```

Follow the prompts. Your app will be live in ~1 minute.

---

## 💻 Run Locally

```bash
npm install
npm start
```

Opens at http://localhost:3000

## 📦 Build for Production

```bash
npm run build
```

Outputs to `/build` folder — can be deployed anywhere (Netlify, Vercel, GitHub Pages, etc.)

---

Made with 💜 by **Porte Boshi**
