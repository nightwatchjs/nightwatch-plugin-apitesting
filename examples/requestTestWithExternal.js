const express = require('express');

describe('api testing with supertest in nightwatch with external app', function () {
  let app;
  let server;

  before(async function(client, done) {
    app = express();
    app.get('/api/v1/', function (req, res) {
      res.status(200).json([
        {
          id: 'test-schema-id1'
        },
        {
          id: 'test-schema-id2'
        }
      ]);
    });

    server = app.listen(3000, function() {
      done();
    });

  });

  after(() => {
    server.close();
  });

  it('demo test', function({supertest}) {
    supertest
      .request(app)
      .get('/api/v1/')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function() {});

    supertest
      .request(app)
      .get('/api/v1/?test=1')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function() {});
  });

  it('demo test async', async function({assert, supertest}) {
    await supertest
      .request(app)
      .get('/api/v1/')
      .expect(200)
      .expect('Content-Type', /json/);

    await assert.strictEqual(true, true);
  });

});