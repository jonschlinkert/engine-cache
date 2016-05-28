/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var assert = require('assert');
var Engines = require('..');
var engines;

describe('engines helpers', function() {
  beforeEach(function() {
    engines = new Engines();
    engines.setEngine('abc', {
      render: function() {},
      renderSync: function() {},
    });
  });

  describe('.helpers()', function() {
    it('should add a helper to the `cache` for the given engine.', function() {
      var helpers = engines.helpers('abc');
      helpers.addHelper('foo', function() {});
      assert.equal(typeof helpers.getHelper('foo'), 'function');
    });

    it('should set helpers on the given engine.', function() {
      var engine = engines.getEngine('abc');
      engine.helpers.addHelper('a', function a() {})
      engine.helpers.addHelper('b', function b() {})
      engine.helpers.addHelper('c', function c() {})

      assert.equal(Object.keys(engine.helpers).length, 3);
    });

    it('should get helpers from the given engine.', function() {
      var engine = engines.getEngine('abc');
      engine.helpers.addHelper('a', function a() {})
      engine.helpers.addHelper('b', function b() {})
      engine.helpers.addHelper('c', function c() {})
      var helper = engine.helpers.getHelper('a');
      assert.equal(typeof helper, 'function');
      assert.equal(helper.name, 'a');
    });

    it('should use helpers added directly to the engine.', function() {
      engines.setEngine('tmpl', require('engine-base'));
      var engine = engines.getEngine('tmpl');

      engine.helpers.addHelper('upper', function(str) {
        return str.toUpperCase();
      });

      var fn = engine.compile('<%= upper(name) %>');
      fn({name: 'foo'})
      assert.equal(fn({name: 'foo'}), 'FOO');
    });
  });
});