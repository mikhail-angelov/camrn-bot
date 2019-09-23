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

  beforeEach(()=>{
    app.setCameraPull({})
  })

  it('should handle register request', async () => {
    const response = await rp.post({
      url: `${baseUrl}/register`,
      body: { camera: 'test', token: 'token', chats: ['one'] },
      method: 'POST',
      json: true,
    })
    expect(response).eql('ok')
    const cp = app.getCameraPull()
    expect(cp.test).eql({ token: 'token', chats: ['one'], messages: {} })
  })

  it('should handle get messages request', async () => {
    const messages = { '123':{ id: 'test' }}
    app.setCameraPull({test1: { messages }})
    const response = await rp(`${baseUrl}/messages/test1`)
    expect(JSON.parse(response)).eql({messages})
  })

  it('should return not registered if there is not such camera in cameraPull', async () => {
    const messages = { '123':{ id: 'test' }}
    app.setCameraPull({test1: { messages }})
    const response = await rp(`${baseUrl}/messages/test3`)
    expect(JSON.parse(response)).eql({status: 'not registered'})
  })

  it('should handle push photo request', async () => {
    app.init({ setChatPhoto: () => {} } )
    app.setCameraPull({test2: { messages: { '123': { chatId: 'test'} }, chats: ['test'] }})
    const img = Buffer.from('test')
    const response = await rp.post({
      url: `${baseUrl}/pushPhoto/test2/123`,
      body: img,
      method: 'POST',
    })
    expect(response).eql('ok')
    const cp = app.getCameraPull()
    expect(cp.test2.messages).eql({})
  })
})
