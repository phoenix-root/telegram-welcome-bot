/**
 * HTML Escaper to prevent Telegram parsing errors
 */
function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format current date in a human-friendly format
 */
function getFormattedDate(timezone = 'Asia/Kolkata') {
  try {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    });
  } catch (e) {
    return new Date().toDateString();
  }
}

/**
 * Generate attractive formatted HTML welcome message for a member
 * @param {object} user - Telegram User object
 * @param {object} chat - Telegram Chat object
 * @param {string} timezone - Timezone string
 * @returns {string} HTML formatted message
 */
function createWelcomeMessage(user, chat, timezone = 'Asia/Kolkata') {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'New Member';
  const escapedName = escapeHtml(fullName);
  const mentionLink = `<a href="tg://user?id=${user.id}"><b>${escapedName}</b></a>`;
  const usernameTag = user.username ? `@${escapeHtml(user.username)}` : '<i>(No username set)</i>';
  const groupTitle = escapeHtml(chat.title || 'Our Group');
  const joinDate = getFormattedDate(timezone);

  return (
    `╔════════════════════════════╗\n` +
    `  ✨ <b>WELCOME TO ${groupTitle.toUpperCase()}!</b> ✨\n` +
    `╚════════════════════════════╝\n\n` +
    `👋 Warmest welcome to ${mentionLink}! We're thrilled to have you here! 🎉\n\n` +
    `╭─「 <b>MEMBER PROFILE</b> 」\n` +
    `│ 👤 <b>Name:</b> ${escapedName}\n` +
    `│ 🏷️ <b>Tag:</b> ${usernameTag}\n` +
    `│ 🆔 <b>User ID:</b> <code>${user.id}</code>\n` +
    `│ 📅 <b>Joined:</b> ${joinDate}\n` +
    `╰───────────────────────────\n\n` +
    `💡 <b>Quick Guidelines:</b>\n` +
    ` • Be respectful & kind to everyone 🤝\n` +
    ` • Introduce yourself to the community 💬\n` +
    ` • Avoid spamming or unsolicited promotion 🚫\n\n` +
    `✨ <i>Have an awesome and inspiring time with us!</i> 🚀💫`
  );
}

/**
 * Get inline keyboard for welcome message
 */
function getWelcomeKeyboard(user) {
  return {
    inline_keyboard: [
      [
        { text: '👤 View Profile', url: `tg://user?id=${user.id}` }
      ]
    ]
  };
}

module.exports = {
  escapeHtml,
  createWelcomeMessage,
  getWelcomeKeyboard
};
