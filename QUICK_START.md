# Quick Start Guide - Push to GitHub & Deploy to Koyeb

## Step 1: Push to GitHub

Since you're using Replit, your code is automatically synced to GitHub through the connected repository. 

If you need to push manually:

1. **Open the Shell** in Replit (Tools → Shell)

2. **Check your repository status:**
```bash
git status
```

3. **Add all files:**
```bash
git add .
```

4. **Commit your changes:**
```bash
git commit -m "Add Premium Quiz Bot Telegram Mini App"
```

5. **Push to GitHub:**
```bash
git push origin main
```

Or if your default branch is `master`:
```bash
git push origin master
```

## Step 2: Get Your Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/mybots`
3. Select your **Premium Quiz Bot**
4. Select "API Token"
5. Copy the token (it looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 3: Deploy to Koyeb

1. **Login to Koyeb**: Go to [https://app.koyeb.com/](https://app.koyeb.com/)

2. **Create New App**:
   - Click "Create App" button
   - Select "GitHub" as deployment method
   - Connect your GitHub account (if not already connected)
   - Select your repository
   - Choose the branch (usually `main` or `master`)

3. **Configure Build**:
   - **Builder**: Docker
   - **Dockerfile**: Leave as `Dockerfile` (auto-detected)
   - **Build context**: `/` (root directory)

4. **Set Environment Variables**:
   Click "Advanced" and add these variables:
   
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_from_step_2
   TELEGRAM_BOT_USERNAME=your_bot_username
   SESSION_SECRET=generate_a_random_string_here
   NODE_ENV=production
   PORT=5000
   ```

   **To generate SESSION_SECRET**, run in Shell:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Configure Service**:
   - **Instance**: Free or Nano (good for starting)
   - **Regions**: Choose closest to your users
   - **Ports**: 5000 (HTTP)
   - **Scale**: 1 instance

6. **Deploy**: Click "Deploy" button

7. **Wait for deployment**: This takes 2-5 minutes

## Step 4: Configure Telegram Mini App

After deployment, you'll get a URL like: `https://your-app-name.koyeb.app`

### Option A: Menu Button (Recommended)

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/mybots`
3. Select your bot
4. Select "Bot Settings" → "Menu Button"
5. Choose "Configure Menu Button"
6. Send your Koyeb URL: `https://your-app-name.koyeb.app`
7. Send a button text: "📊 Open Quiz App"

### Option B: Web App

1. In BotFather, send `/newapp`
2. Select your bot
3. Provide:
   - **Title**: Premium Quiz Bot
   - **Description**: Create and manage quizzes
   - **Photo**: Upload app icon (512x512 recommended)
   - **Demo**: (skip or provide demo GIF)
   - **Short name**: Choose unique short name (e.g., `premiumquiz`)
   - **Web App URL**: `https://your-app-name.koyeb.app`

## Step 5: Test Your Mini App

1. Open your bot in Telegram
2. Click the Menu Button or Web App
3. The Mini App should load showing the Dashboard
4. Try creating a quiz to test functionality

## Troubleshooting

### App Not Loading
- **Check Koyeb Logs**: In Koyeb dashboard, view your app logs for errors
- **Verify Environment Variables**: Make sure all variables are set correctly
- **Check Build Status**: Ensure Docker build completed successfully

### Mini App Not Opening in Telegram
- **Verify URL**: Make sure the Koyeb URL is correct in BotFather
- **Check HTTPS**: Telegram requires HTTPS (Koyeb provides this automatically)
- **Test URL in Browser**: Open the URL directly to see if app loads

### Build Failures
- **Check Dockerfile**: Ensure it's in the root directory
- **Dependencies**: Verify package.json is complete
- **Koyeb Logs**: Check build logs for specific errors

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | `1234567890:ABC...` | Your bot token from BotFather |
| `TELEGRAM_BOT_USERNAME` | Yes | `premium_quiz_bot` | Your bot's username |
| `SESSION_SECRET` | Yes | `a1b2c3d4e5...` | Random secret for sessions |
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | Yes | `5000` | Server port |

## Next Steps

Once deployed:

1. **Monitor**: Check Koyeb dashboard for app health and logs
2. **Test**: Create quizzes and verify all features work
3. **Scale**: Upgrade Koyeb instance if needed for more users
4. **Database**: Consider adding PostgreSQL for persistent storage
5. **Analytics**: Monitor quiz engagement and user activity

## Need Help?

- **Koyeb Docs**: [https://www.koyeb.com/docs](https://www.koyeb.com/docs)
- **Telegram Mini Apps**: [https://core.telegram.org/bots/webapps](https://core.telegram.org/bots/webapps)
- **Check Logs**: Always check Koyeb logs for debugging

---

**Your Mini App is ready to deploy! 🚀**
