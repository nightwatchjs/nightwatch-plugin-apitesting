describe('api testing with supertest in nightwatch', function () {

  let server;

  before(async function(client) {
    server = await client.mockserver.create();

    server.setup((app) => {
      app.get('/api/v1/schemas', function (req, res) {
        console.log('GET /api/v1/schemas called');
        res.status(200).json([
          {
            id: 'test-schema-id1'
          },
          {
            id: 'test-schema-id2'
          }
        ]);
      });

      app.post('/api/v1/datasets/', function (req, res) {
        res.status(200).json({
          id: 'test-dataset-id'
        });
      });
    });

    await server.start(3000);
  });

  after(() => {
    server.close();
  });

  it('demo test', async function(client) {
    const req = await server.request()
      .get('/api/v1/schemas')
      .expect(200)
      .expect('Content-Type', /json/);

    client
      .assert.strictEqual(server.route.get('/api/v1/schemas').calledOnce, true, 'called once')
      .assert.strictEqual(server.route.get('/api/v1/schemas').calledTwice, false);

    console.log('requestHeaders', server.route.get('/api/v1/schemas').requestHeaders)
    console.log('requestCookies', server.route.get('/api/v1/schemas').requestCookies)
    console.log('requestBody', server.route.get('/api/v1/schemas').requestBody)
    console.log('requestParams', server.route.get('/api/v1/schemas').requestParams)

    client
      .expect(server.route.get('/api/v1/schemas').requestHeaders)
      .to.have.property('connection', 'close');
  });
});