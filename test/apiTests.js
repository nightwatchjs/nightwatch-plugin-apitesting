const assert = require('assert');
const { spawn } = require('child_process');
const path = require("path");

describe('run nightwatch api tests', function () {

  it('run api tests', function (done) {

    const childProcess = spawn(path.resolve('node_modules/.bin/nightwatch'), ['examples/requestTest.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', process.stderr]
    });

    let output = '';
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.on('exit', function (code) {
      assert.strictEqual(code, 0);
      assert.ok(output.includes('.get(\'/api/v1/schemas\').expect(200)'));
      assert.ok(output.includes('.get(\'/api/v1/schemas\').expect(\'Content-Type\', /json/)'));
      assert.ok(output.match(/Expected \{ host: '127\.0\.0\.1:\d+', …\(2\) \}  to have property\('connection'\)/));

      const { report } = require(path.resolve('tests_output/requestTest.json'));
      assert.strictEqual(report.assertionsCount, 5);
      assert.strictEqual(report.passedCount, 5);
      assert.strictEqual(report.failures, 0);
      assert.strictEqual(report.errors, 0);


      done();
    });

  });

  it('run api tests with failures', function (done) {

    const childProcess = spawn(path.resolve('node_modules/.bin/nightwatch'), ['examples/requestTestWithFailures.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    childProcess.on('exit', function (code) {
      assert.strictEqual(code, 5);

      assert.ok(output.includes('FAILED: 1 assertions failed and  1 passed'));
      assert.ok(output.includes('✖ NightwatchAssertError'));
      assert.ok(output.includes('expected "Content-Type" matching /jsonx/, got "application/json; charset=utf-8"'));
      assert.ok(output.includes('examples/requestTestWithFailures.js:'));
      assert.ok(output.includes('29 |       .get(\'/api/v1/schemas\')'));

      const { report } = require(path.resolve('tests_output/requestTestWithFailures.json'));
      assert.strictEqual(report.assertionsCount, 2);
      assert.strictEqual(report.passedCount, 1);
      assert.strictEqual(report.failures, 1);
      assert.strictEqual(report.errors, 0);


      done();
    });

  });

  it('run api tests with external', function (done) {

    const childProcess = spawn(path.resolve('node_modules/.bin/nightwatch'), ['examples/requestTestWithExternal.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.on('exit', function (code) {
      assert.strictEqual(code, 0);

      assert.ok(output.includes('PASSED. 7 assertions.'));
      assert.ok(output.includes('PASSED. 7 total assertions '));
      assert.ok(output.includes('.get(\'/api/v1/\').expect(200)'));
      assert.ok(output.includes('.get(\'/api/v1/?test=1\').expect(200)'));
      assert.ok(output.includes('.get(\'/api/v1/\').expect(\'Content-Type\', /json/)'));

      done();
    });

  });

});
