# 🤖 Telegram Group Welcome & Daily Greetings Bot

A modern, lightweight Node.js Telegram bot designed for Telegram Group Chats (GC). It automatically welcomes new members with their **Telegram ID** and **User Tag/Mention**, and sends daily **Good Morning**, **Good Afternoon**, and **Good Evening** greetings.

Includes a built-in keep-alive web server so you can host it **24/7 without needing your laptop or computer on**.

---

## ✨ Features

- 👤 **New Member Welcome**: Automatically welcomes every new member who joins your group.
- 🆔 **Mentions User ID & Tag**: Mentions the user's clickable name/tag (`@username`), unique Telegram ID (`123456789`), and join date.
- ⏱️ **5-Second Anti-Flood Delay**: All multi-member welcome queues and greeting broadcasts have a guaranteed 5-second delay between messages to eliminate spam and protect against Telegram rate limits.
- ⏰ **Daily Automated Greetings**:
  - 🌅 **Good Morning** (08:00 AM)
  - ☀️ **Good Afternoon** (01:00 PM)
  - 🌆 **Good Evening** (06:00 PM)
- 🌍 **Customizable Timezone**: Easily change timezone in `.env` (default: `Asia/Kolkata` for IST).
- 🧪 **Greeting Test Commands**: Admins can test greetings instantly using `/testgreeting`.
- ⚡ **24/7 Cloud Hosting Ready**: Built-in Express web server with `/health` monitor endpoint ready for Render, Koyeb, Railway, or VPS.

---

## 📁 Project Structure

```
phoenix welcome bot/
├── data/
│   └── storage.js          # Persistent JSON storage for registered groups
├── src/
│   ├── greetings.js        # Scheduled daily greetings (morning/afternoon/evening)
│   └── welcome.js          # Welcome message generator with ID & tag mentions
├── index.js                # Main bot app & Express keepalive server
├── .env.example            # Environment variables example
├── .env                    # Local configuration (BOT_TOKEN, TIMEZONE)
├── Dockerfile              # Docker container definition
├── render.yaml             # 1-click Render blueprint configuration
└── package.json            # Node.js dependencies & scripts
```

---

## 🛠️ Step 1: Create Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot`.
3. Give your bot a **Name** (e.g., `Phoenix Welcome Bot`) and a **Username** ending in `bot` (e.g., `phoenix_welcome_robot`).
4. `@BotFather` will give you a **Bot API Token** (looks like `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).
5. **Important Group Settings**:
   - In `@BotFather`, send `/setprivacy`.
   - Choose your bot and select **Disable**. *(This allows your bot to read join events and messages in groups without issues)*.
   - Alternatively, you can make the bot an **Administrator** in your group with "Delete Messages" permission.

---

## 🚀 Step 2: Local Quick Setup & Test

1. Open the `.env` file in this folder.
2. Paste your bot token:
   ```env
   BOT_TOKEN=your_actual_token_from_botfather
   TIMEZONE=Asia/Kolkata
   ```
3. Start the bot:
   ```bash
   npm start
   ```
4. You should see:
   ```
   🚀 Web keepalive server running on port 3000
   [Scheduler] Initializing daily greetings scheduler with timezone: Asia/Kolkata
   🤖 Telegram Bot started successfully in polling mode!
   ```
5. Add the bot to your Telegram group and test!

---

## ☁️ Step 3: How to Host 24/7 for FREE (No Laptop Required!)

You can host this bot completely free in the cloud so it runs 24 hours a day, 7 days a week, even when your laptop is turned off.

### Method A: Koyeb (Easiest - Never Goes to Sleep)

1. Create a free account at [Koyeb.com](https://www.koyeb.com).
2. Upload this bot folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/telegram-welcome-bot.git
   git push -u origin main
   ```
3. On the Koyeb Dashboard, click **Create App** ➔ Choose **GitHub**.
4. Select your repository.
5. In **Environment Variables**, add:
   - `BOT_TOKEN`: Your Telegram bot token
   - `TIMEZONE`: `Asia/Kolkata` (or your timezone)
6. Click **Deploy**. Koyeb will run your bot 24/7 for free!

---

### Method B: Render.com + UptimeRobot (100% Free 24/7)

1. Push your code to GitHub (same as above).
2. Go to [Render.com](https://render.com) and create a free account.
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Fill in the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Scroll down to **Environment Variables** and add:
   - `BOT_TOKEN`: `your_bot_token_from_botfather`
   - `TIMEZONE`: `Asia/Kolkata`
7. Click **Create Web Service**.
8. Once deployed, Render will give you a public URL (e.g., `https://your-bot-name.onrender.com`).
9. **Keep it awake 24/7**:
   - Render's free tier sleeps after 15 minutes of inactivity. To prevent this:
   - Sign up at [UptimeRobot.com](https://uptimerobot.com) (100% Free).
   - Click **Add New Monitor**.
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Telegram Bot Ping`
   - **URL**: `https://your-bot-name.onrender.com/health`
   - **Monitoring Interval**: `5 minutes`
   - Click **Create Monitor**.
   - That's it! UptimeRobot will ping the `/health` endpoint every 5 minutes, keeping your bot awake 24/7!

---

## 🎮 Bot Commands

| Command | Who Can Use | Description |
|---|---|---|
| `/start` | Everyone | Activates the bot in the chat / shows welcome info |
| `/help` | Everyone | Shows list of available commands and usage guide |
| `/status` | Everyone | Displays uptime, registered groups, and your User ID |
| `/greetings on` | Admins | Enables daily Good Morning, Afternoon & Evening messages |
| `/greetings off` | Admins | Pauses daily greeting messages for the group |
| `/testgreeting morning` | Admins | Immediately previews the Good Morning greeting message |
| `/testgreeting afternoon` | Admins | Immediately previews the Good Afternoon greeting message |
| `/testgreeting evening` | Admins | Immediately previews the Good Evening greeting message |

---

## ⚙️ Customizing Greetings & Times

In your `.env` file, you can customize the timing using standard cron format:

```env
# 8:00 AM (Hour 8, Minute 0)
CRON_MORNING=0 8 * * *

# 1:00 PM (Hour 13, Minute 0)
CRON_AFTERNOON=0 13 * * *

# 6:00 PM (Hour 18, Minute 0)
CRON_EVENING=0 18 * * *
```

To edit the greeting messages, simply modify `src/greetings.js`.
To customize the welcome card layout, edit `src/welcome.js`.
