const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_TOKEN || 'any'
const options = { webHook: { port: 443 } }

const url = process.env.BOT_URL || process.env.NOW_URL
console.log('bot hook ur:', url)
const bot = new TelegramBot(token, options)
bot.setWebHook(`${url}/bot${token}`)

bot.on('message', function onMessage(msg) {
  console.log('-', msg)
  bot.sendMessage(msg.chat.id, 'not ready yet')
})
