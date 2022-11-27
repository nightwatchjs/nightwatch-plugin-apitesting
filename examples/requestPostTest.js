describe('api testing with supertest in nightwatch POST', function () {

  let server;

  before(async function(client) {
    server = await client.mockserver.create();
    server.setup((app) => {
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
      .post('/api/v1/datasets/')
      .send({name: 'medea'})
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    await client.assert.deepStrictEqual(server.route.post('/api/v1/datasets/').requestBody, {name: 'medea'});
  });

});