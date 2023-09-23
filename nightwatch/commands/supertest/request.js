const EventEmitter = require('events');
const methods = require('methods');
const request = require('supertest');
const {Logger} = require('nightwatch');

module.exports = class SuperTest extends EventEmitter {
  static createRequestFn(context) {
    return function(app, callback) {
      const result = {};
      const api = this.api;
      const pluginSettings = this.client.settings['@nightwatch/apitesting'] || {};
      const {argv} = this.client

      methods.forEach((key) => {
        result[key] = new function() {
          return function (...args) {
            const startTime = new Date();
            const res = request(app)[key](...args);

            const expectFn = res.expect;

            const endFn = res.end;
            const assertArgs = [];
            const assertStack = [];
            let assertions;

            res.end = function(fn) {
              assertions = res._asserts.slice(0);
              res._asserts.length = 0;

              return endFn.call(res, function(err, resp) {
                if (err) {
                  return fn(err, resp);
                }  

                if ((pluginSettings.log_responses || argv.verbose)) {
                  Logger.info(`  Response ${key.toUpperCase()} ${resp.request.url} (${new Date() - startTime}ms) `,  resp.body, '\n');
                }

                assertions.forEach((assertion, index) => {
                  const errorObj = res._assertFunction(assertion, resp);
                  if (errorObj instanceof Error) {
                    const stack = assertStack[index].split('\n');
                    stack.shift();
                    errorObj.stack = stack.join('\n');
                    api.assert.fail(errorObj);

                    return;
                  }

                  const processedArgs = assertArgs[index].map(i => typeof i == 'string' ? ('\'' + i +'\'') : i).join(', ');
                  api.assert.ok(`.${key}('${args[0]}').expect(${processedArgs})`);
                });

                fn(null, resp);
              });
            };

            res.expect = function(...exArgs) {
              const mainStack = new Error().stack;

              assertArgs.push(exArgs);
              assertStack.push(mainStack);

              return expectFn.apply(res, exArgs);
            }.bind(this);

            return res;
          }.bind(this);
        }
      });

      callback.call(context, result);

      return result;
    }.bind(context);
  }

  command(app, callback = function() {}) {
    this.app = app;

    return SuperTest.createRequestFn(this)(app, callback);
  }
}

module.exports.autoInvoke = true;
