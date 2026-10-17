const cron = require('node-cron');
const { getGroups } = require('../data/storage');

// Helper delay function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DELAY_PER_MSG_MS = 5000; // 5 seconds delay per message

/**
 * Get current day name (e.g., Monday)
 */
function getDayName(timezone = 'Asia/Kolkata') {
  try {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
  } catch (e) {
    return 'Today';
  }
}

// Highly Attractive Greeting Messages Pools
function getMorningMessages(day) {
  return [
    `╔════════════════════════════╗\n` +
    `  ☀️ <b>RISE & SHINE! GOOD MORNING!</b> 🌅\n` +
    `╚════════════════════════════╝\n\n` +
    `☕ <i>"Every morning is a blank canvas. Paint it with your brightest colors!"</i>\n\n` +
    `╭─「 <b>DAILY KICK-OFF</b> 」\n` +
    `│ 📅 <b>Day:</b> Happy ${day}!\n` +
    `│ 🔋 <b>Energy:</b> 100% Charged\n` +
    `│ 🎯 <b>Daily Focus:</b> Stay productive & positive\n` +
    `╰───────────────────────────\n\n` +
    `💪 Wishing all members an amazing, successful, and blessed day ahead! Let's conquer our goals! 🌟🚀`,

    `╔════════════════════════════╗\n` +
    `  🌄 <b>GOOD MORNING COMMUNITY!</b> ☀️\n` +
    `╚════════════════════════════╝\n\n` +
    `✨ <i>"Opportunities don't just happen, you create them."</i>\n\n` +
    `╭─「 <b>MORNING MOTIVATION</b> 」\n` +
    `│ ☕ Grab a warm cup of coffee or tea\n` +
    `│ 🎯 Set your top 3 goals for today\n` +
    `│ 💫 Take a deep breath & smile!\n` +
    `╰───────────────────────────\n\n` +
    `🌸 May your day be filled with happiness, good news, and endless energy! Have a wonderful ${day}! 🌿✨`
  ];
}

function getAfternoonMessages(day) {
  return [
    `╔════════════════════════════╗\n` +
    `  🍱 <b>GOOD AFTERNOON EVERYONE!</b> ☀️\n` +
    `╚════════════════════════════╝\n\n` +
    `🥗 <i>"Take a break, fuel your body, and recharge your soul!"</i>\n\n` +
    `╭─「 <b>MID-DAY REMINDER</b> 」\n` +
    `│ 🥪 <b>Lunch Break:</b> Don't skip your meal!\n` +
    `│ 💧 <b>Hydration:</b> Drink a glass of water\n` +
    `│ ⚡ <b>Status:</b> Halfway through the day\n` +
    `╰───────────────────────────\n\n` +
    `🌻 Keep pushing forward! You are doing great. Have a peaceful and productive afternoon! 🍹✨`,

    `╔════════════════════════════╗\n` +
    `  🌤️ <b>GOOD AFTERNOON FAM!</b> 🍹\n` +
    `╚════════════════════════════╝\n\n` +
    `⚡ <i>"Stay strong, stay focused, the best part of the day is ahead!"</i>\n\n` +
    `╭─「 <b>POWER BOOST</b> 」\n` +
    `│ 🧘 Take a quick 5-minute stretch\n` +
    `│ 💡 Refresh your thoughts & mindset\n` +
    `│ 🚀 Finish your tasks with confidence\n` +
    `╰───────────────────────────\n\n` +
    `🌈 Hope everyone's ${day} afternoon is relaxing, joyful, and smooth! Keep shining! 🌟`
  ];
}

function getEveningMessages(day) {
  return [
    `╔════════════════════════════╗\n` +
    `  🌆 <b>GOOD EVENING EVERYONE!</b> 🌙\n` +
    `╚════════════════════════════╝\n\n` +
    `🛋️ <i>"The day's hustle is over. It's time to relax, recharge, and unwind."</i>\n\n` +
    `╭─「 <b>EVENING SERENITY</b> 」\n` +
    `│ ☕ <b>Mood:</b> Chill & Relaxed\n` +
    `│ 🎶 <b>Tonight's Vibe:</b> Rest & Good Conversations\n` +
    `│ 🌌 <b>Gratitude:</b> Celebrate today's progress!\n` +
    `╰───────────────────────────\n\n` +
    `✨ Kick off your shoes, spend time with loved ones, and enjoy a wonderful ${day} evening! 🥂🎶`,

    `╔════════════════════════════╗\n` +
    `  🌌 <b>GOOD EVENING MEMBERS!</b> 🌠\n` +
    `╚════════════════════════════╝\n\n` +
    `🌙 <i>"Peace begins when the noise of the day fades away."</i>\n\n` +
    `╭─「 <b>NIGHT-TIME WIN DOWN</b> 」\n` +
    `│ 📖 Catch up on your favorite hobbies\n` +
    `│ 💬 Share some laughs with friends\n` +
    `│ 🌿 Let go of any stress from today\n` +
    `╰───────────────────────────\n\n` +
    `🌟 Wishing each and every one of you a cozy, calm, and delightful evening ahead! 💫☕`
  ];
}

function getRandomMessage(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Send greeting to all registered groups with a 5-second delay between each group
 * @param {object} bot - Telegraf bot instance
 * @param {string} type - 'morning' | 'afternoon' | 'evening'
 * @param {string} timezone - IANA timezone
 */
async function broadcastGreeting(bot, type, timezone = 'Asia/Kolkata') {
  const groups = getGroups();
  const groupList = Object.values(groups).filter(g => g.greetingsEnabled !== false);

  if (groupList.length === 0) {
    console.log(`[Greetings] No active groups registered for ${type} greeting.`);
    return;
  }

  const day = getDayName(timezone);
  let message = '';
  if (type === 'morning') message = getRandomMessage(getMorningMessages(day));
  else if (type === 'afternoon') message = getRandomMessage(getAfternoonMessages(day));
  else if (type === 'evening') message = getRandomMessage(getEveningMessages(day));
  else message = getRandomMessage(getMorningMessages(day));

  console.log(`[Greetings] Broadcasting ${type} greeting to ${groupList.length} group(s) (5s delay per message)...`);

  for (let i = 0; i < groupList.length; i++) {
    const group = groupList[i];
    try {
      await bot.telegram.sendMessage(group.id, message, { parse_mode: 'HTML' });
      console.log(`[Greetings] Sent ${type} greeting to "${group.title}" (${group.id})`);
    } catch (error) {
      console.error(`[Greetings] Failed to send to "${group.title}" (${group.id}):`, error.message);
    }

    // 5-second delay between each message to avoid Telegram rate limits
    if (i < groupList.length - 1) {
      console.log(`[Greetings] Waiting 5 seconds before sending to next group...`);
      await sleep(DELAY_PER_MSG_MS);
    }
  }
}

/**
 * Setup cron jobs for morning, afternoon, and evening greetings
 * @param {object} bot - Telegraf bot instance
 * @param {string} timezone - IANA timezone (e.g. 'Asia/Kolkata')
 */
function setupGreetings(bot, timezone = 'Asia/Kolkata') {
  console.log(`[Scheduler] Initializing daily greetings scheduler with timezone: ${timezone}`);

  // Morning greeting: 08:00 AM daily
  const morningCron = process.env.CRON_MORNING || '0 8 * * *';
  cron.schedule(
    morningCron,
    () => {
      console.log('[Scheduler] Triggering Good Morning broadcast...');
      broadcastGreeting(bot, 'morning', timezone);
    },
    { timezone }
  );

  // Afternoon greeting: 01:00 PM (13:00) daily
  const afternoonCron = process.env.CRON_AFTERNOON || '0 13 * * *';
  cron.schedule(
    afternoonCron,
    () => {
      console.log('[Scheduler] Triggering Good Afternoon broadcast...');
      broadcastGreeting(bot, 'afternoon', timezone);
    },
    { timezone }
  );

  // Evening greeting: 06:00 PM (18:00) daily
  const eveningCron = process.env.CRON_EVENING || '0 18 * * *';
  cron.schedule(
    eveningCron,
    () => {
      console.log('[Scheduler] Triggering Good Evening broadcast...');
      broadcastGreeting(bot, 'evening', timezone);
    },
    { timezone }
  );

  console.log(`[Scheduler] Scheduled jobs:`);
  console.log(` - 🌅 Good Morning:   ${morningCron} (${timezone})`);
  console.log(` - ☀️ Good Afternoon: ${afternoonCron} (${timezone})`);
  console.log(` - 🌆 Good Evening:   ${eveningCron} (${timezone})`);
}

module.exports = {
  setupGreetings,
  broadcastGreeting,
  getMorningMessages,
  getAfternoonMessages,
  getEveningMessages,
  getRandomMessage,
  sleep,
  DELAY_PER_MSG_MS
};
