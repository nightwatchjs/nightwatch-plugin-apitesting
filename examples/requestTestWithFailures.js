describe('api testing with supertest in nightwatch with failures', function () {

  let server;

  before(async function(client) {
    server = await client.mockserver.create();
    server.setup((app) => {
      app.get('/api/v1/schemas', function (req, res) {
        res.status(200).json([
          {
            id: 'test-schema-id1'
          },
          {
            id: 'test-schema-id2'
          }
        ]);
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
      .expect('Content-Type', /jsonx/);

    client
      .assert.strictEqual(server.route.get('/api/v1/schemas').calledOnce, true, 'called once')
      .assert.strictEqual(server.route.get('/api/v1/schemas').calledTwice, false);

  });
});