# Deployment Guide for Koyeb

This guide will help you deploy the Premium Quiz Bot Telegram Mini App on Koyeb.

## Prerequisites

1. A [Koyeb account](https://app.koyeb.com/)
2. A Telegram Bot Token from [@BotFather](https://t.me/BotFather)
3. Your code pushed to a GitHub repository

## Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the **Bot Token** provided by BotFather
5. Save your **Bot Username**

## Step 2: Deploy on Koyeb

### Option A: Deploy from GitHub (Recommended)

1. **Login to Koyeb**: Go to [https://app.koyeb.com/](https://app.koyeb.com/)

2. **Create a New App**:
   - Click "Create App"
   - Choose "GitHub" as the deployment method
   - Select your repository
   - Select the branch (usually `main` or `master`)

3. **Configure Build Settings**:
   - **Builder**: Docker
   - **Dockerfile**: `Dockerfile` (should auto-detect)
   - **Build context**: `/` (root directory)

4. **Configure Environment Variables**:
   Add the following environment variables:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
   TELEGRAM_BOT_USERNAME=your_bot_username
   SESSION_SECRET=generate_a_random_secret_string
   NODE_ENV=production
   PORT=5000
   ```

5. **Configure Service Settings**:
   - **Instance**: Free or Nano (for starting)
   - **Regions**: Choose closest to your users
   - **Port**: 5000
   - **Health check path**: `/` (optional)

6. **Deploy**: Click "Deploy"

### Option B: Deploy from Docker Registry

1. Build and push your Docker image to Docker Hub or GitHub Container Registry
2. In Koyeb, select "Docker" as deployment method
3. Enter your image URL
4. Configure environment variables as above
5. Deploy

## Step 3: Configure Your Telegram Bot

After deployment, you'll receive a Koyeb URL like: `https://your-app-name.koyeb.app`

### Set up the Mini App

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/mybots`
3. Select your bot
4. Select "Bot Settings" → "Menu Button"
5. Choose "Configure Menu Button"
6. Send the URL: `https://your-app-name.koyeb.app`
7. Send a button text like: "Open Quiz App"

### Set up Web App (Alternative)

1. In BotFather, send `/newapp`
2. Select your bot
3. Provide app details:
   - Title: "Premium Quiz Bot"
   - Description: "Create and manage quizzes"
   - Photo: Upload an icon (512x512 recommended)
   - Demo GIF: (Optional)
   - Short name: A unique short name
   - Web App URL: `https://your-app-name.koyeb.app`

## Step 4: Test Your Mini App

1. Open your bot in Telegram
2. Click the menu button or use the web app link
3. The Mini App should load

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather | Yes |
| `TELEGRAM_BOT_USERNAME` | Your bot's username | Yes |
| `SESSION_SECRET` | Random secret for session encryption | Yes |
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Port number (default: 5000) | No |
| `DATABASE_URL` | PostgreSQL connection URL (optional) | No |

## Troubleshooting

### App Not Loading
- Check Koyeb logs for errors
- Verify all environment variables are set correctly
- Ensure the PORT is set to 5000

### Telegram Mini App Not Opening
- Verify the Web App URL is correct in BotFather
- Check that your Koyeb deployment is running
- Test the URL directly in a browser

### Build Failures
- Check that all dependencies are in package.json
- Verify Dockerfile syntax
- Review Koyeb build logs

## Updating Your App

When you push changes to your GitHub repository:
1. Koyeb will automatically detect the changes
2. It will rebuild and redeploy your app
3. No manual intervention needed (if auto-deploy is enabled)

## Scaling

As your user base grows:
1. Upgrade your Koyeb instance size
2. Consider adding a PostgreSQL database
3. Enable caching for better performance

## Support

For issues:
- Check Koyeb documentation: [https://www.koyeb.com/docs](https://www.koyeb.com/docs)
- Review Telegram Mini Apps docs: [https://core.telegram.org/bots/webapps](https://core.telegram.org/bots/webapps)
