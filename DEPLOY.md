
# CopyTrade Deployment & Production Guide

Follow these steps to launch your elite terminal.

### 1. Intelligence Layer (Gemini API)
Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a Gemini API Key. This powers the Sarah (Account Manager) and Market Analyst Hub engines.

### 2. Project Repository
1. Initialize a GitHub repository.
2. Push all project files.

---

### 3. Deploy to Netlify (Recommended)
Netlify is the easiest way to host this application for free with high performance.

1. **Login**: Go to [Netlify.com](https://www.netlify.com) and log in.
2. **Add New Site**: Click **"Add new site"** > **"Import an existing project"**.
3. **Connect GitHub**: Select GitHub and choose your repository.
4. **Build Settings**: Netlify will detect the `netlify.toml` file automatically.
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
5. **Environment Variables**:
   - Click on **"Site settings"** > **"Environment variables"**.
   - Add a key named `API_KEY` and paste your Google Gemini API Key.
6. **Deploy**: Click **"Deploy site"**.

---

### 4. Deploy to Vercel (Alternative)
1. Connect your repo to [Vercel](https://vercel.com).
2. **Environment Variables**:
   - `API_KEY`: [Your Gemini API Key]
3. Click **Deploy**.

---

### 5. Running Non-Stop
Once deployed, the application is hosted on globally distributed edge servers. It runs **non-stop 24/7** without any need for local hosting or manual restarts. The serverless architecture ensures 99.9% uptime.

### 6. Source Protection
The current build is configured to:
- Disable Source Maps.
- Strip Console Logs.
- Deter inspection shortcuts.
- Minify and Obfuscate logic via Terser.

Your terminal is now ready for institutional-grade deployment.
