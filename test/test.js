'use strict';

var assert = require('assert');
var lodash = require('engine-base');
var Engines = require('..');
var engines;

describe('engines', function() {
  beforeEach(function() {
    engines = new Engines();
  });

  describe('.inspect()', function() {
    it('should expose a custom inspect method on the instance', function() {
      engines.setEngine('hbs', function() {});
      var hbs = engines.getEngine('hbs');
      assert.equal(hbs.inspect(), '<Engine "hbs" <ext ".hbs">>');
    });
  });

  describe('`this` context', function() {
    it('should call engine methods using the engine instance', function(cb) {
      var hbs;
      engines.setEngine('hbs', {
        render: function(str, locals, cb) {
          assert.equal(this, hbs);
          cb(null, str);
          return;
        },
        compile: function(str) {
          assert.equal(this, hbs);
          return str;
        }
      });

      hbs = engines.getEngine('hbs');
      hbs.compile('foo')(function(err, content) {
        if (err) return cb(err);
        cb();
      });
    });

    it('should engine instance should have `asyncHelpers` instance', function(cb) {
      var hbs;
      engines.setEngine('hbs', {
        render: function(str, locals, cb) {
          assert.equal(this.asyncHelpers, hbs.asyncHelpers);
          cb(null, str);
          return;
        },
        compile: function(str) {
          assert.equal(this.asyncHelpers, hbs.asyncHelpers);
          return str;
        }
      });

      hbs = engines.getEngine('hbs');
      hbs.compile('foo')(function(err, content) {
        if (err) return cb(err);
        cb();
      });
    });
  });
});
