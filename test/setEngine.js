/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var assert = require('assert');
var lodash = require('engine-base');
var Engines = require('..');
var engines;

describe('engines set', function() {
  beforeEach(function() {
    engines = new Engines();
  });

  describe('errors', function() {
    it('should throw an error when args are invalid', function(cb) {
      try {
        engines.setEngine({});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'expected an object or function');
      }

      try {
        engines.setEngine(null);
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'expected an object or function');
      }
      cb();
    });

    it('should throw an error when engine is invalid', function(cb) {
      try {
        engines.setEngine('tmpl', {});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'expected engine to have a render or renderSync method');
        cb();
      }
    });
  });

  describe('.setEngine()', function() {
    it('should cache the lodash engine.', function() {
      var ctx = {name: 'Jon Schlinkert'};
      engines.setEngine('tmpl', lodash);
      assert(engines.getEngine('tmpl').hasOwnProperty('render'));
    });

    it('should set engines on the `engines` object.', function() {
      engines.setEngine('a', {render: function() {} });
      engines.setEngine('b', {render: function() {} });
      engines.setEngine('c', {render: function() {} });
      engines.setEngine('d', {render: function() {} });

      assert(engines.cache.hasOwnProperty('.a'));
      assert(engines.cache.hasOwnProperty('.b'));
      assert(engines.cache.hasOwnProperty('.c'));
      assert(engines.cache.hasOwnProperty('.d'));
    });

    it('should normalize engine extensions to have a dot.', function() {
      engines.setEngine('a', {render: function() {} });
      engines.setEngine('.b', {render: function() {} });
      engines.setEngine('c', {render: function() {} });
      engines.setEngine('.d', {render: function() {} });

      assert(engines.cache.hasOwnProperty('.a'));
      assert(engines.cache.hasOwnProperty('.b'));
      assert(engines.cache.hasOwnProperty('.c'));
      assert(engines.cache.hasOwnProperty('.d'));
    });

    it('should be chainable.', function() {
      engines
        .setEngine('a', {render: function() {} })
        .setEngine('b', {render: function() {} })
        .setEngine('c', {render: function() {} })
        .setEngine('d', {render: function() {} });

      assert(engines.cache.hasOwnProperty('.a'));
      assert(engines.cache.hasOwnProperty('.b'));
      assert(engines.cache.hasOwnProperty('.c'));
      assert(engines.cache.hasOwnProperty('.d'));
    });

    it('should allow options to be passed as the last argument.', function() {
      engines.setEngine('a', {render: function() {}}, {foo: 'bar'})
      assert.equal(typeof engines.getEngine('.a').options.foo, 'string');
    });

    it('should allow options to be passed as the second argument.', function() {
      engines.setEngine('a', {foo: 'bar'}, {render: function() {}})
      assert.equal(typeof engines.getEngine('.a').options.foo, 'string');
    });
  });
});
