'use strict';

var assert = require('assert');
var base = require('engine-base');
var Engines = require('..');
var engines;

describe('engines get', function() {
  beforeEach(function() {
    engines = new Engines();
  });

  describe('.getEngine()', function() {
    it('should get the given engine from the `cache`.', function() {
      engines.setEngine('a', {render: function() {} });
      engines.setEngine('b', {render: function() {} });
      engines.setEngine('c', {render: function() {} });
      engines.setEngine('d', {render: function() {} });

      engines.getEngine('a').hasOwnProperty('render');
      engines.getEngine('b').hasOwnProperty('render');
      engines.getEngine('c').hasOwnProperty('render');
      engines.getEngine('d').hasOwnProperty('render');
    });

    it('should return undefined when a falsey value is passed', function() {
      assert.equal(engines.getEngine(), undefined);
    });

    it('should use a default if defined:', function() {
      engines.options.defaultEngine = '*';
      engines.setEngine('*', require('engine-base'));

      var engine = engines.getEngine('tmpl');
      assert.equal(typeof engine.render, 'function');
    });

    it('should use a default as a function if defined:', function() {
      engines.options.defaultEngine = require('engine-base');

      var engine = engines.getEngine('tmpl');
      assert.equal(typeof engine.render, 'function');
    });

    it('should render templates', function(cb) {
      var base = require('engine-base');
      engines.setEngine('tmpl', base);

      var engine = engines.getEngine('tmpl');

      engine.render('<%= name %>', {name: 'Jon Schlinkert'}, function(err, content) {
        if (err) return cb(err);
        assert.equal(content, 'Jon Schlinkert');
        cb();
      });
    });
  });
});
