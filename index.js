const TOKEN = process.env.TELEGRAM_TOKEN || 'any';
const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    // Just use 443 directly
    port: 443
  }
};

const url = 'https://<your-domain>.now.sh' || process.env.BOT_URL;
console.log('--', url, token)
const bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);

bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'yo');
});