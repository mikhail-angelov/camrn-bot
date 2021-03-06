const micro = require('micro')

let cameraPull = {}
let bot = null

const init = (telegramBot)=>{
  bot = telegramBot
}

const onInfo = (msg) => {
  console.log('on info:', msg.chat.id, JSON.stringify(msg.from))
  bot.sendMessage(msg.chat.id, 'this is smart camera bot, available commands /setCam <camera name> <token>, /selfie')
}
const onSelfie = (msg) => {
  console.log('on selfie:', msg.chat.id, msg.from.username)
  const chatId = msg.chat.id
  const camera = chatCamera(chatId)
  if (chatId && camera) {
    cameraPull[camera].event = { id: msg.id, type: 'selfie', chatId, timestamp: Date.now() }
  }else{
    bot.sendMessage(msg.chat.id, 'Camera is not set for this chant, use /setCam command')
  }
}
const onSetCam = (msg, match) => {
  const chatId = msg.chat.id
  const params = match[1]
  console.log('on setCam:', msg.chat.id, msg.from.username, params)
  if (chatId && params && params.split(/\s+/).length > 1) {
    const [camera, token] = params.split(/\s+/)
    cameraPull[camera] = cameraPull[camera] || { event: null }
    cameraPull[camera].event = { id: msg.id, type: 'register', chatId, token }
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
const sendImageToChat = (message, img) => bot.setChatPhoto(message.chatId, img)

const register = async (req, res) => {
  const { camera, token, chats } = await micro.json(req)
  console.log('register:', camera, chats)
  cameraPull[camera] = { token, chats, event: null }
  micro.send(res, 200, 'ok')
}
const getMessage = (req, res) => {
  console.log('get messages:', req.params)
  const camera = req.params.camera
  if(!camera){
    return micro.send(res, 400, 'invalid params')
  }
  if (cameraPull[camera]) {
    return micro.send(res, 200, JSON.stringify(cameraPull[camera].event))
  }else{
    return micro.send(res, 200, JSON.stringify({type: 'not registered'}))
  }
  
}
const pushPhoto = async (req, res) => {
  console.log('get photo', req.params)
  const camera = req.params.camera
  const messageId = req.params.messageId
  const img = await micro.buffer(req)
  if (camera && messageId && cameraPull[camera] && cameraPull[camera].event) {
    sendImageToChat(cameraPull[camera].event, img)
    cameraPull[camera].event = null
    return micro.send(res, 200, 'ok')
  }
  return micro.send(res, 400, 'invalid params')
}

const getCameraPull = ()=>cameraPull
const setCameraPull = (data)=>{cameraPull=data}

module.exports = {
  init,
  onInfo,
  onSelfie,
  onSetCam,
  register,
  getMessage,
  pushPhoto,
  
  //private
  getCameraPull,
  setCameraPull,
}
