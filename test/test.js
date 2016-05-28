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
});
