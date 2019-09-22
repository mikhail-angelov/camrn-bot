const micro = require('micro')
const { router, get, post } = require('microrouter')
const TelegramBot = require('node-telegram-bot-api')
const { onInfo, onSelfie, onSetCam, register, getMessage, pushPhoto } = require('./app')

const token = process.env.TELEGRAM_TOKEN || 'any'
const port = process.env.PORT || 3000
const url = process.env.BOT_URL || process.env.NOW_URL
const bot = new TelegramBot(token, { webHook: { port: 443 } })

bot.setWebHook(`${url}/bot${token}`)
bot.onText(/\/info (.+)/, msg => onInfo(bot, msg))
bot.onText(/\/selfie (.+)/, msg => onSelfie(bot, msg))
bot.onText(/\/setCam (.+)/, (msg, match) => onSetCam(bot, msg, match))

const server = micro(
  router(
    post('/register', register),
    post('/pushPhoto/:camera/:messageId', pushPhoto),
    get('/messages/:camera', getMessage)
  )
)

server.listen(port, () => {
  console.log('bot hook ur:', url)
  console.log('HTTP server is started on:', port)
})
