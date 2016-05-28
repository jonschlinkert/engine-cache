'use strict';

require('should');
var assert = require('assert');
var Engines = require('..');
var engines = new Engines();
var consolidate = require('consolidate');

describe('engines render', function() {
  before(function() {
    engines = new Engines();
  });

  describe('errors', function() {
    it('should throw an error when no callback is passed', function() {
      engines.setEngine('tmpl', require('engine-lodash'));
      var tmpl = engines.getEngine('tmpl');

      (function() {
        tmpl.render({});
      }).should.throw('engine-cache "render" expected "callback" to be a function.');
    });
  });

  describe('.render()', function() {
    it('should error when bad args are passed.', function(done) {
      engines.setEngine('hbs', consolidate.handlebars);
      var hbs = engines.getEngine('hbs');

      hbs.render(null, function(err, content) {
        if (!err) return done(new Error('Expected an error'));
        assert(err.message === 'engine-cache "render" expected "str" to be a string or compiled function.');
        done();
      });
    });

    it('should render content with a cached engine: [handlebars].', function(done) {
      engines.setEngine('hbs', consolidate.handlebars);
      var hbs = engines.getEngine('hbs');

      hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function(err, content) {
        if (err) return done(err);
        assert(content === 'Jon Schlinkert');
        done();
      });
    });

    it('should handle engine errors.', function(done) {
      engines.setEngine('tmpl', require('engine-lodash'));
      var tmpl = engines.getEngine('tmpl');

      tmpl.render('<%= foo %>', function(err, content) {
        if (!err) return done(new Error('Expected an error'));
        assert(err.message === 'foo is not defined');
        done();
      });
    });

    it('should throw an error when a helper is undefiend', function(done) {
      engines.setEngine('tmpl', require('engine-lodash'));
      var tmpl = engines.getEngine('tmpl');

      tmpl.render('<%= upper(foo) %>', function(err, content) {
        if (!err) return done(new Error('Expected an error'));
        assert(err.message === 'upper is not defined');
        done();
      });
    });
  });  

  it('should render content from a compiled function:', function(cb) {
    var lodash = require('engine-lodash');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    
    lodash.render(fn, ctx, function(err, res) {
      if (err) return cb(err);
      assert(res === 'Jon Schlinkert');
      cb();
    });
  });

  it('should handle errors:', function(cb) {
    var lodash = require('engine-lodash');
    var ctx = {};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');

    lodash.render(fn, ctx, function(err, res) {
      if (!err) return cb(new Error('expected an error'));
      assert(err.message === 'name is not defined');
      cb();
    });
  });
});
