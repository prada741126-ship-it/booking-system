/**
 * bot/config.example.js — Example Configuration for BookingHub Bot
 * Copy this file to bot/config.js and fill in your values.
 * Or set environment variables instead.
 *
 * Quick Start:
 *   1. Create a bot via @BotFather on Telegram → get BOT_TOKEN
 *   2. Set env: set TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
 *   3. Run: node bot/bot.js
 */

module.exports = {

  // Telegram Bot Token from @BotFather
  // Get it by messaging @BotFather → /newbot → follow instructions
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',

  // Authorized Telegram user IDs (optional)
  // Get your user ID by messaging @userinfobot on Telegram
  // Empty array = allow all users (not recommended for production)
  AUTHORIZED_USERS: [
    // 123456789,  // Example: user ID
  ],

  // Firebase config (must match web app src/core/constants.js)
  FIREBASE: {
    API_KEY: 'AIzaSyC3NKqEVUpL-9WYvun7pBbJe8P7T8o4Y74',
    DB_URL: 'https://macau-app-default-rtdb.asia-southeast1.firebasedatabase.app',
    PROJECT_ID: 'macau-app'
  },

  // Polling settings
  POLL_TIMEOUT: 30,       // long-poll seconds
  POLL_RETRY_DELAY: 3000, // retry on error (ms)

  // Session timeout (ms) — idle sessions expire after this
  SESSION_TIMEOUT: 10 * 60 * 1000 // 10 minutes
};
