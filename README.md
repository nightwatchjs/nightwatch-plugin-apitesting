# @nightwatch/apitesting

[![npm](https://img.shields.io/npm/v/@nightwatch/apitesting.svg)](https://www.npmjs.com/package/@nightwatch/apitesting)
[![Node.js CI](https://github.com/nightwatchjs/nightwatch-plugin-apitesting/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/nightwatchjs/nightwatch-plugin-apitesting/actions/workflows/build.yml)
[![Discord][discord-badge]][discord]

## Nightwatch.js API Testing

This plugin brings support for API testing into Nightwatch. It contains the following features:
- integration with [superagent](https://www.npmjs.com/package/supertest) for testing HTTP requests
- built-in mock server based on [express](https://www.npmjs.com/package/express) with support for [sinon](https://www.npmjs.com/package/sinon) assertions on mocked HTTP requests  

Requires Nightwatch 2.5.2 or higher. 

## Installation

```sh
npm i nightwatch @nightwatch/apitesting --save-dev
```

## Configuration

Edit your `nightwatch.json` (or `nightwatch.conf.js`) file and add the following:
 
```json
{
  "start_session": false,
  "webdriver": {
    "start_process": false
  },
  "plugins": [
    "@nightwatch/apitesting"      
  ]
}
```

## Usage

### Test API requests with superagent
[superagent](https://www.npmjs.com/package/supertest) is a popular HTTP request library that is used in many Node.js projects. 

Using `supertest` in Nightwatch allows you to test your API endpoints and assert on the responses using its popular fluent API. 

#### Example:

```js
const express = require('express');

describe('api testing with supertest in nightwatch', function () {
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

  it('demo test async', async function({supertest}) {
    await supertest
      .request(app)
      .get('/api/v1/')
      .expect(200)
      .expect('Content-Type', /json/);
  });

});
```

You can also use the classic callback style:

```js
  it('demo test', function({supertest}) {
    supertest
      .request(app)
      .get('/api/v1/')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function() {
        console.log('done');
      });
  });
```

### Integrated mock server

The plugin also provides a built-in mock server based on [express](https://www.npmjs.com/package/express) that can be used to assert incoming http requests.

#### API
- `const mockServer = await client.mockserver.create()` – creates a new mock server instance
- `await mockServer.setup(definition)` – setup an existing mock server instance with the provided route definition
   Example:
    ```js
    await mockServer.setup((app) => {
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
      })
    });
    ```
- `await mockServer.start(port)` – starts an existing mock server instance on the specified port
- `await mockServer.route(path)` – returns a [sinon spy](https://sinonjs.org/releases/latest/spies/) on the specified route

### Assert on incoming requests

Use the `mockServer.route(path)` method to retrive a spy on the specified route. You can then use the [sinon assertions](https://sinonjs.org/releases/latest/spies/#spyanonymous) to assert on the incoming requests. 

#### Example

Consider the previous mock server setup example. If we want to assert that the `GET /api/v1/schemas` route was called, we can do the following:

```js
  it('demo test', async function(client) {
    client
      .assert.strictEqual(mockServer.route.get('/api/v1/schemas').calledOnce, true, 'called once')
      .assert.strictEqual(mockServer.route.get('/api/v1/schemas').calledTwice, false);
  });
```

#### Assert on request headers

We can also assert on the request headers, for example using the built-in `expect()` assertions API which uses on [chai](https://www.chaijs.com/api/bdd/):

```js
  it('demo test', async function(client) {
    const {requestHeaders} = mockServer.route.get('/api/v1/schemas');

    client.expect(requestHeaders).to.have.property('connection', 'close');
  });
```

### Assert on incoming post data

We can also assert on the incoming post data: 

1) First setup a post route for the mock server:

```js
await mockServer.setup((app) => {
  app.post('/api/v1/datasets/', function (req, res) {
    res.status(200).json({
      id: 'test-dataset-id'
    });
  });
});
```

2) Then use the `mockServer.route.post(path)` method to retrive a spy on the specified route. You can then use the [sinon assertions](https://sinonjs.org/releases/latest/spies/#spyanonymous) to assert on the incoming requests. 

```js
  it('demo test', async function(client) {
    const {requestBody} = mockServer.route.post('/api/v1/schemas');

    await client.assert.deepStrictEqual(requestBody, {name: 'medea'});
  });
```

## License
MIT

[discord-badge]: https://img.shields.io/discord/618399631038218240.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square
[discord]: https://discord.gg/SN8Da2X
