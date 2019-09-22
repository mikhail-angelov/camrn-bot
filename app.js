const micro = require('micro')

const cameraPull = {}

const onInfo = (bot, msg) => {
  console.log('on info:', msg.chat.id, JSON.stringify(msg.from))
  bot.sendMessage(msg.chat.id, 'this is smart camera bot, available commands /setCam <camera name> <token>, /selfie')
}
const onSelfie = (bot, msg) => {
  console.log('on selfie:', msg.chat.id, msg.from.username)
  const chatId = msg.chat.id
  const camera = chatCamera(chatId)
  if (chatId && camera) {
    cameraPull[camera].messages[msg.id] = { type: 'selfie', chatId, bot }
  }
}
const onSetCam = (bot, msg, match) => {
  const chatId = msg.chat.id
  const params = match[1]
  console.log('on setCam:', msg.chat.id, msg.from.username, params)
  if (chatId && params && params.split(/\s+/).length > 1) {
    const [camera, token] = params.split(/\s+/)
    cameraPull[camera] = cameraPull[camera] || { messages: {} }
    cameraPull[camera].messages[msg.id] = { type: 'register', chatId, token, bot }
  }
}

//todo: only one camera per chat for now
const chatCamera = chatId => {
  const camera = Object.keys(cameraPull).reduce(
    (acc, camId) => (cameraPull[camId].chats.includes(chatId) ? cameraPull[camId] : acc),
    null
  )
  return camera
}
const sendImageToChat = (message, img) => message.bot.setChatPhoto(message.chatId, img)

const register = async (req, res) => {
  const { camera, token, chats } = await micro.json(req)
  console.log('register:', camera, chats)
  cameraPull[camera] = { token, chats, messages: {} }
  micro.send(res, 200, 'ok')
}
const getMessage = (req, res) => {
  console.log('messages:', req.params)
  const camera = req.params.camera
  if (camera && cameraPull[camera] && cameraPull[camera].messages) {
    return micro.send(res, 200, JSON.stringify(cameraPull[camera].messages))
  }
  return micro.send(res, 400, 'invalid params')
}
const pushPhoto = async (req, res) => {
  console.log('get photo', req.params)
  const camera = req.params.camera
  const messageId = req.params.messageId
  const img = await micro.buffer(req)
  if (camera && messageId && cameraPull[camera] && cameraPull[camera].messages[messageId]) {
    sendImageToChat(cameraPull[camera].messages[messageId], img)
    delete cameraPull[camera].messages[messageId]
    return micro.send(res, 200, 'ok')
  }
  return micro.send(res, 400, 'invalid params')
}

module.exports = {
  onInfo,
  onSelfie,
  onSetCam,
  cameraPull,
  register,
  getMessage,
  pushPhoto,
}
