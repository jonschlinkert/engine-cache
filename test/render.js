'use strict';

var assert = require('assert');
var Engines = require('..');
var engines = new Engines();
var consolidate = require('consolidate');

describe('engines render', function() {
  before(function() {
    engines = new Engines();
  });

  describe('errors', function() {
    it('should throw an error when no callback is passed', function(cb) {
      engines.setEngine('tmpl', require('engine-base'));
      var tmpl = engines.getEngine('tmpl');
      try {
        tmpl.render({});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'expected a callback function');
        cb();
      }
    });
  });

  describe('.render()', function() {
    it('should error when bad args are passed.', function(cb) {
      engines.setEngine('hbs', consolidate.handlebars);
      var hbs = engines.getEngine('hbs');

      hbs.render(null, function(err, content) {
        assert(err);
        assert.equal(err.message, 'expected a string or compiled function');
        cb();
      });
    });

    it('should render content with a cached engine: [handlebars].', function(cb) {
      engines.setEngine('hbs', consolidate.handlebars);
      var hbs = engines.getEngine('hbs');

      hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function(err, content) {
        if (err) return cb(err);
        assert.equal(content, 'Jon Schlinkert');
        cb();
      });
    });

    it('should handle engine errors.', function(cb) {
      engines.setEngine('tmpl', require('engine-base'));
      var tmpl = engines.getEngine('tmpl');

      tmpl.render('<%= foo %>', function(err, content) {
        assert(err);
        assert.equal(err.message, 'foo is not defined');
        cb();
      });
    });

    it('should throw an error when a helper is undefined', function(cb) {
      engines.setEngine('tmpl', require('engine-base'));
      var tmpl = engines.getEngine('tmpl');

      tmpl.render('<%= upper(foo) %>', function(err, content) {
        assert(err);
        assert.equal(err.message, 'upper is not defined');
        cb();
      });
    });
  });  

  it('should render content from a compiled function:', function(cb) {
    var lodash = require('engine-base');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    
    lodash.render(fn, ctx, function(err, res) {
      if (err) return cb(err);
      assert.equal(res, 'Jon Schlinkert');
      cb();
    });
  });

  it('should handle errors:', function(cb) {
    var lodash = require('engine-base');
    var ctx = {};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');

    lodash.render(fn, ctx, function(err, res) {
      assert(err);
      assert.equal(err.message, 'name is not defined');
      cb();
    });
  });
});
