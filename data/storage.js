const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data_store');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(GROUPS_FILE)) {
  fs.writeFileSync(GROUPS_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

/**
 * Read all stored groups
 * @returns {Record<string, { id: number|string, title: string, addedAt: string, greetingsEnabled: boolean }>}
 */
function getGroups() {
  try {
    const data = fs.readFileSync(GROUPS_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error('[Storage] Error reading groups:', error.message);
    return {};
  }
}

/**
 * Save or update a group
 */
function saveGroup(chatId, title = 'Unnamed Group') {
  try {
    const groups = getGroups();
    const idKey = String(chatId);
    if (!groups[idKey]) {
      groups[idKey] = {
        id: chatId,
        title,
        addedAt: new Date().toISOString(),
        greetingsEnabled: true
      };
    } else {
      groups[idKey].title = title;
    }
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2), 'utf-8');
    return groups[idKey];
  } catch (error) {
    console.error('[Storage] Error saving group:', error.message);
  }
}

/**
 * Remove a group when bot is kicked/leaves
 */
function removeGroup(chatId) {
  try {
    const groups = getGroups();
    const idKey = String(chatId);
    if (groups[idKey]) {
      delete groups[idKey];
      fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2), 'utf-8');
      console.log(`[Storage] Removed group ${chatId}`);
    }
  } catch (error) {
    console.error('[Storage] Error removing group:', error.message);
  }
}

/**
 * Toggle greetings for a group
 */
function toggleGreetings(chatId, enabled) {
  try {
    const groups = getGroups();
    const idKey = String(chatId);
    if (groups[idKey]) {
      groups[idKey].greetingsEnabled = Boolean(enabled);
      fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2), 'utf-8');
      return groups[idKey].greetingsEnabled;
    }
  } catch (error) {
    console.error('[Storage] Error toggling greetings:', error.message);
  }
  return null;
}

module.exports = {
  getGroups,
  saveGroup,
  removeGroup,
  toggleGreetings
};
