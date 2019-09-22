const { expect } = require('chai')
const micro = require('micro')
const { router, get, post } = require('microrouter')
const rp = require('request-promise')

const port = '1567'
const app = require('./app')
const server = micro(
  router(
    post('/register', app.register),
    post('/pushPhoto/:camera/:messageId', app.pushPhoto),
    get('/messages/:camera', app.getMessage)
  )
)

describe('chat bot integration test', function() {
  this.timeout(1000000)
  const baseUrl = `http://localhost:${port}`
  before(done => server.listen(1567, done))
  after(() => server.close())

  it('should handle register request', async () => {
    const response = await rp.post({
      url: `${baseUrl}/register`,
      body: { camera: 'test', token: 'token', chats: ['one'] },
      method: 'POST',
      json: true,
    })
    expect(response).eql('ok')
    expect(app.cameraPull.test).eql({ token: 'token', chats: ['one'], messages: {} })
  })

  it('should handle get messages request', async () => {
    const messages = [{ id: 'test' }]
    app.cameraPull.test1 = { messages }
    const response = await rp(`${baseUrl}/messages/test1`)
    expect(JSON.parse(response)).eql(messages)
  })

  it('should handle push photo request', async () => {
    app.cameraPull.test2 = { messages: { '123': { chatId: 'test', bot: { setChatPhoto: () => {} } } }, chats: ['test'] }
    const img = Buffer.from('test')
    const response = await rp.post({
      url: `${baseUrl}/pushPhoto/test2/123`,
      body: img,
      method: 'POST',
    })
    expect(response).eql('ok')
  })
})
