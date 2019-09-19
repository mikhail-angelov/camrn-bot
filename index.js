const TOKEN = process.env.TELEGRAM_TOKEN || '655190042:AAGj7FCHGmLF2NzhOq3vLWuAvfhHTpeaXm4';
const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    // Just use 443 directly
    port: 443
  }
};

const url = 'https://<your-domain>.now.sh' || process.env.NOW_URL;
const bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);

bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'yo');
});