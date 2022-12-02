const express = require('express');
const sinon = require('sinon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methods = require('methods');
const cors = require('cors');
const SuperTest = require('../supertest/request.js');

const spies = {};

module.exports = class {

  constructor() {
    this.server = null;
  }

  createRequestAssertion(method, path) {
    spies[method] = spies[method] || {};
    const spy = spies[method][path];

    if (!spy) {
      return sinon.spy(function() {});
    }

    const request = spy.lastCall || {};

    Object.defineProperties(spy, {
      requestHeaders: {
        configurable: true,
        get: () => {
          const headers = Array.isArray(request.args) && request.args[0] ? request.args[0].headers : null;

          return headers;
        }
      },

      requestParams: {
        configurable: true,
        get: () => {
          const params = Array.isArray(request.args) && request.args[0] ? request.args[0].params : null;

          return params;
        }
      },

      requestBody: {
        configurable: true,
        get: () => {
          const body = Array.isArray(request.args) && request.args[0] ? request.args[0].body : null;

          return body;
        }
      },

      requestCookies: {
        configurable: true,
        get: () => {
          const cookies = Array.isArray(request.args) && request.args[0] ? request.args[0].cookies : null;

          return cookies;
        }
      },

      response: {
        configurable: true,
        get: () => {
          return Array.isArray(request.args) && request.args[1] ? request.args[1] : null;
        }
      }
    });

    return spy;
  }

  command(callback = function() {}) {
    this.app = express();
    this.app.use(bodyParser.urlencoded({extended: false}));
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(cors());

    const result = {
      start: function(port) {
        return new Promise((resolve, reject) => {
          this.server = this.app.listen(port, () => {
            console.log(`Mock server listening on port ${port}`);
            resolve(this.server);
          });
        });
      }.bind(this),

      close: function() {
        if (this.server) {
          return this.server.close();
        }
      }.bind(this),

      setup: function(mockFn) {
        const {app} = this;
        methods.forEach(key => {
          const getFn = app[key];

          Object.defineProperty(app, key, {
            configurable: true,
            enumerable: true,
            value: function(...args) {
              if (args.length === 1) {
                return getFn.call(app, args[0]);
              }

              spies[key] = spies[key] || {};
              if (!spies[key][args[0]]) {
                spies[key][args[0]] = sinon.spy(args[1]);
              }

              return getFn.call(this, args[0], function(...fnArgs) {
                return spies[key][args[0]].apply(this, fnArgs);
              });
            }
          });
        });

        mockFn(app);
      }.bind(this),

      route: (() => {
        return methods.reduce((acc, method) => {
          acc[method] = (path) => {
            return this.createRequestAssertion(method, path);
          };

          return acc;
        }, {});
      })(),

      request: function(app = this.app, callback = function() {}) {
        return SuperTest.createRequestFn(this)(app, callback)
      }.bind(this)
    };

    callback(result);

    return result;
  }
}