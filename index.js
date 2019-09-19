const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN || 'any';
const options = {
  webHook: {
    // Just use 443 directly
    port: 443
  }
};

const url = process.env.NOW_URL;
console.log('--', process.env.BOT_URL, process.env.NOW_URL, token)
const bot = new TelegramBot(token, options);
bot.setWebHook(`${url}/bot${token}`);

bot.on('message', function onMessage(msg) {
    console.log('-', msg)
  bot.sendMessage(msg.chat.id, 'yo');
});