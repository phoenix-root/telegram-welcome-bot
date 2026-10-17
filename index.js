require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { getGroups, saveGroup, removeGroup, toggleGreetings } = require('./data/storage');
const { createWelcomeMessage, getWelcomeKeyboard } = require('./src/welcome');
const {
  setupGreetings,
  broadcastGreeting,
  getRandomMessage,
  getMorningMessages,
  getAfternoonMessages,
  getEveningMessages,
  sleep,
  DELAY_PER_MSG_MS
} = require('./src/greetings');

// 1. Verify Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error('\n❌ ERROR: Telegram BOT_TOKEN is missing or not set in .env!');
  console.error('👉 Please create a bot with @BotFather on Telegram and set BOT_TOKEN in your .env file.\n');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;
const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';

// Startup timestamp
const startTime = Date.now();

// Helper: Check if sender is admin in group
async function isGroupAdmin(ctx) {
  try {
    if (ctx.chat.type === 'private') return true;
    const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
    return ['creator', 'administrator'].includes(member.status);
  } catch (e) {
    return false;
  }
}

// ----------------------------------------------------
// 2. Telegram Event Listeners
// ----------------------------------------------------

// Automatically register groups on any incoming group message
bot.use(async (ctx, next) => {
  if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
    saveGroup(ctx.chat.id, ctx.chat.title);
  }
  return next();
});

// Welcome New Chat Members (with 5-second delay between members)
bot.on('message:new_chat_members', async (ctx) => {
  try {
    const newMembers = ctx.message.new_chat_members;
    const botInfo = await ctx.telegram.getMe();

    for (let i = 0; i < newMembers.length; i++) {
      const member = newMembers[i];

      // If the bot itself was added to the group
      if (member.id === botInfo.id) {
        saveGroup(ctx.chat.id, ctx.chat.title);
        await ctx.reply(
          `╔════════════════════════════╗\n` +
          `  🤖 <b>PHOENIX BOT ACTIVATED!</b> 🚀\n` +
          `╚════════════════════════════╝\n\n` +
          `👋 Hello <b>${ctx.chat.title}</b>! Thank you for having me here!\n\n` +
          `✨ <b>My Responsibilities:</b>\n` +
          ` • 👤 Welcome every new member with their ID & Tag\n` +
          ` • 🌅 Good Morning greetings (08:00 AM)\n` +
          ` • ☀️ Good Afternoon greetings (01:00 PM)\n` +
          ` • 🌆 Good Evening greetings (06:00 PM)\n` +
          ` • ⏱️ 5-second anti-spam delay between messages\n\n` +
          `💡 <i>Tip: Promote me to Admin with "Delete Messages" permission for the best experience. Type /help to see commands!</i>`,
          { parse_mode: 'HTML' }
        );
        continue;
      }

      // Welcome human members
      const welcomeText = createWelcomeMessage(member, ctx.chat, TIMEZONE);
      const keyboard = getWelcomeKeyboard(member);

      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });

      console.log(`[Welcome] Welcomed ${member.first_name} (ID: ${member.id}) to "${ctx.chat.title}"`);

      // 5-second delay between multiple joining members to prevent flood/rate limits
      if (i < newMembers.length - 1) {
        console.log(`[Welcome] Waiting 5 seconds before next welcome message...`);
        await sleep(DELAY_PER_MSG_MS);
      }
    }
  } catch (error) {
    console.error('[Welcome] Error welcoming members:', error.message);
  }
});

// Handle Bot Chat Member Updates (e.g. Bot added, removed, or promoted)
bot.on('my_chat_member', async (ctx) => {
  try {
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const chat = ctx.myChatMember.chat;

    if (['member', 'administrator'].includes(newStatus)) {
      saveGroup(chat.id, chat.title);
      console.log(`[Bot] Added/Updated in group "${chat.title}" (${chat.id})`);
    } else if (['left', 'kicked'].includes(newStatus)) {
      removeGroup(chat.id);
      console.log(`[Bot] Removed from group "${chat.title}" (${chat.id})`);
    }
  } catch (error) {
    console.error('[Bot] Error in my_chat_member update:', error.message);
  }
});

// Command: /start
bot.command('start', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply(
      `╔════════════════════════════╗\n` +
      `  🤖 <b>PHOENIX WELCOME BOT</b> 🌟\n` +
      `╚════════════════════════════╝\n\n` +
      `Hey <b>${ctx.from.first_name}</b>! I am your 24/7 automated Telegram Group Assistant!\n\n` +
      `📌 <b>Key Features:</b>\n` +
      `• 🏷️ <b>Smart Welcomer:</b> Greets new members with their ID, mention, and tag.\n` +
      `• ⏰ <b>Daily Greetings:</b> Automated Good Morning, Afternoon & Evening messages.\n` +
      `• ⏱️ <b>5s Message Delay:</b> Zero spam and full anti-flood protection.\n` +
      `• ☁️ <b>24/7 Cloud Ready:</b> Always active without needing your laptop.\n\n` +
      `🚀 <b>How to Setup:</b>\n` +
      `1. Add me to your Telegram Group.\n` +
      `2. Give me Admin permissions.\n` +
      `3. Send /help in the group to get started!`,
      { parse_mode: 'HTML' }
    );
  }

  // Inside Group
  saveGroup(ctx.chat.id, ctx.chat.title);
  await ctx.reply(
    `✅ <b>Phoenix Bot is fully active in this group!</b>\n\n` +
    `• Welcome System: <b>ON</b> (Includes User ID & Tag) ✅\n` +
    `• Daily Greetings: <b>ON</b> (Morning, Afternoon, Evening) ✅\n` +
    `• Rate-Limit Delay: <b>5 seconds</b> ✅\n\n` +
    `Type <code>/help</code> to view available commands.`,
    { parse_mode: 'HTML' }
  );
});

// Command: /help
bot.command('help', async (ctx) => {
  const helpText =
    `📖 <b>COMMANDS & CONTROLS</b>\n\n` +
    `• <code>/start</code> - Check bot status & activate in group\n` +
    `• <code>/help</code> - Show this commands guide\n` +
    `• <code>/status</code> - View group ID, uptime & statistics\n` +
    `• <code>/greetings on</code> - Enable daily greetings in this group (Admin)\n` +
    `• <code>/greetings off</code> - Disable daily greetings in this group (Admin)\n` +
    `• <code>/testgreeting morning</code> - Test Good Morning greeting preview (Admin)\n` +
    `• <code>/testgreeting afternoon</code> - Test Good Afternoon greeting preview (Admin)\n` +
    `• <code>/testgreeting evening</code> - Test Good Evening greeting preview (Admin)\n\n` +
    `⏱️ <i>Note: All multi-message broadcasts follow a 5-second interval.</i>`;

  await ctx.reply(helpText, { parse_mode: 'HTML' });
});

// Command: /status
bot.command('status', async (ctx) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const groups = getGroups();
  const groupCount = Object.keys(groups).length;

  const statusMsg =
    `╔════════════════════════════╗\n` +
    `  📊 <b>SYSTEM STATUS REPORT</b> 🟢\n` +
    `╚════════════════════════════╝\n\n` +
    `• 🟢 <b>Status:</b> Online & Running 24/7\n` +
    `• ⏳ <b>Uptime:</b> ${hours}h ${minutes}m ${seconds}s\n` +
    `• 👥 <b>Active Groups:</b> ${groupCount}\n` +
    `• 🌍 <b>Timezone:</b> <code>${TIMEZONE}</code>\n` +
    `• ⏱️ <b>Delay Per Message:</b> <code>${DELAY_PER_MSG_MS / 1000} seconds</code>\n` +
    `• 💬 <b>Chat ID:</b> <code>${ctx.chat.id}</code>\n` +
    `• 👤 <b>Your ID:</b> <code>${ctx.from.id}</code>\n`;

  await ctx.reply(statusMsg, { parse_mode: 'HTML' });
});

// Command: /greetings [on|off]
bot.command('greetings', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('⚠️ This command can only be used inside groups.');
  }

  const isAdmin = await isGroupAdmin(ctx);
  if (!isAdmin) {
    return ctx.reply('⚠️ Only group administrators can manage greeting settings.');
  }

  const text = ctx.message.text.split(' ')[1]?.toLowerCase();
  if (text === 'on') {
    toggleGreetings(ctx.chat.id, true);
    return ctx.reply('✅ Daily greetings have been <b>ENABLED</b> for this group.', { parse_mode: 'HTML' });
  } else if (text === 'off') {
    toggleGreetings(ctx.chat.id, false);
    return ctx.reply('⏸️ Daily greetings have been <b>DISABLED</b> for this group.', { parse_mode: 'HTML' });
  } else {
    return ctx.reply('ℹ️ Usage: <code>/greetings on</code> or <code>/greetings off</code>', { parse_mode: 'HTML' });
  }
});

// Command: /testgreeting [morning|afternoon|evening]
bot.command('testgreeting', async (ctx) => {
  const isAdmin = await isGroupAdmin(ctx);
  if (!isAdmin) {
    return ctx.reply('⚠️ Only group administrators can test greetings.');
  }

  const args = ctx.message.text.split(' ');
  const type = args[1]?.toLowerCase();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: TIMEZONE });

  let message = '';
  if (type === 'morning') message = getRandomMessage(getMorningMessages(day));
  else if (type === 'afternoon') message = getRandomMessage(getAfternoonMessages(day));
  else if (type === 'evening') message = getRandomMessage(getEveningMessages(day));
  else {
    return ctx.reply(
      'ℹ️ Usage:\n' +
      '• <code>/testgreeting morning</code>\n' +
      '• <code>/testgreeting afternoon</code>\n' +
      '• <code>/testgreeting evening</code>',
      { parse_mode: 'HTML' }
    );
  }

  await ctx.reply(`🧪 <b>[Test Preview - ${type.toUpperCase()}]</b>\n\n${message}`, { parse_mode: 'HTML' });
});

// Global Error Handler for Telegraf
bot.catch((err, ctx) => {
  console.error(`[Telegraf Error] Update ${ctx.updateType}:`, err.message);
});

// ----------------------------------------------------
// 3. Express Web Server (Enables 24/7 Hosting on Cloud)
// ----------------------------------------------------
app.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const groups = getGroups();
  const groupCount = Object.keys(groups).length;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Phoenix Telegram Bot - 24/7 Online</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #111827; padding: 36px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); max-width: 500px; width: 100%; border: 1px solid #1f2937; }
        .status { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; }
        .dot { width: 10px; height: 10px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        h1 { margin: 18px 0 8px; font-size: 26px; font-weight: 700; color: #ffffff; }
        p { color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
        .info-grid { background: #030712; padding: 20px; border-radius: 12px; font-size: 14px; display: grid; gap: 12px; border: 1px solid #1f2937; }
        .info-row { display: flex; justify-content: space-between; }
        .info-label { color: #6b7280; }
        .info-val { font-weight: 600; color: #f3f4f6; }
        .footer { margin-top: 24px; text-align: center; font-size: 13px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="status"><div class="dot"></div> ONLINE 24/7</div>
        <h1>Phoenix Telegram Bot</h1>
        <p>Active 24/7 Group Assistant with ID & Tag welcome messages, daily scheduled greetings, and 5-second anti-flood delay.</p>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">Active Groups:</span><span class="info-val">${groupCount}</span></div>
          <div class="info-row"><span class="info-label">Uptime:</span><span class="info-val">${Math.floor(uptimeSeconds / 60)} mins</span></div>
          <div class="info-row"><span class="info-label">Delay Per Message:</span><span class="info-val">5 Seconds</span></div>
          <div class="info-row"><span class="info-label">Timezone:</span><span class="info-val">${TIMEZONE}</span></div>
          <div class="info-row"><span class="info-label">Current Time:</span><span class="info-val">${new Date().toLocaleTimeString('en-US', { timeZone: TIMEZONE })}</span></div>
        </div>
        <div class="footer">Hosted 24/7 without laptop &bull; Endpoint: <code>/health</code></div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint for UptimeRobot / Cron services
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'Phoenix',
    uptime: process.uptime(),
    delaySeconds: DELAY_PER_MSG_MS / 1000,
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 4. Start Server and Telegram Bot
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Web keepalive server running on port ${PORT}`);
});

// Initialize daily greeting cron schedules
setupGreetings(bot, TIMEZONE);

// Launch bot
bot.launch().then(() => {
  console.log('🤖 Telegram Bot (@' + (bot.botInfo?.username || 'Phoenix') + ') started successfully in polling mode!');
}).catch((err) => {
  console.error('❌ Failed to start Telegram Bot:', err.message);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
