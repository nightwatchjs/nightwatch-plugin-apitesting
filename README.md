# @nightwatch/apitesting

[![npm](https://img.shields.io/npm/v/@nightwatch/apitesting.svg)](https://www.npmjs.com/package/@nightwatch/apitesting)
[![tests](https://github.com/nightwatchjs/nightwatch-plugin-apitesting/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/nightwatchjs/nightwatch-plugin-apitesting/actions/workflows/build.yml)
[![Discord][discord-badge]][discord]

## API Testing in Nightwatch

This plugin brings support for API testing into Nightwatch. It contains the following features:
- integration with [supertest](https://www.npmjs.com/package/supertest) for testing HTTP requests
- built-in mock server based on [express](https://www.npmjs.com/package/express) with support for [sinon](https://www.npmjs.com/package/sinon) assertions on mocked HTTP requests  

Requires Nightwatch 2.6.4 or higher. 

## Installation

1) Install the plugin from NPM:

```sh
npm i @nightwatch/apitesting --save-dev
```

2) Edit your `nightwatch.json` (or `nightwatch.conf.js`) file and add the following:
 
```json
{
  "plugins": [
    "@nightwatch/apitesting"      
  ]
}
```

3) Disable the browser session

We also need to turn off the browser session, since we're only doing API testing. This can be accomplished by setting these properties:

```json
{
  "start_session": false,
  "webdriver": {
    "start_process": false
  }
}
```  

## Configuration

The plugin has for now only one configuration option, which is weather or not to log the HTTP responses to the console. This can be configured in the `nightwatch.json` (or `nightwatch.conf.js`) config file:

```json
{
  "@nightwatch/apitesting" : {
    "log_responses": true
  }
}
```

## Usage

### Test Syntax

> All `supertest.request()` calls should be `await`ed. The classic callback syntax is not supported.

### Test API requests with supertest
[supertest](https://www.npmjs.com/package/supertest) is a popular HTTP request library that is used in many Node.js projects. 

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

For waiting for incoming requests tests, you can use the [`waitUntil()`](https://nightwatchjs.org/api/waitUntil.html) command.

Example using waitUntil:
```js
  it('demo test', async function(client) {
    const timeoutMs = 15000;
    const retryIntervalMs = 500;
    
    await client.waitUntil(async function () {
      const spy = server.route.get('/api/v1/schemas');

      if (spy) {
        return spy.calledOnce;
      }

      return false;
    }, timeoutMs, retryIntervalMs, new Error(`time out reached (10000ms) while waiting for API call.`));  
  });
```


## License
MIT

[discord-badge]: https://img.shields.io/discord/618399631038218240.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square
[discord]: https://discord.gg/SN8Da2X
