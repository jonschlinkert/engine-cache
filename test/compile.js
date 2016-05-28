'use strict';

require('mocha');
require('should');
var assert = require('assert');
var Engines = require('..');
var engines = new Engines();
var engine = require('engine-handlebars');

describe('engines compile', function() {
  before(function() {
    engines = new Engines();
  });

  describe('.compile()', function() {
    it('should compile content with a cached engine: [handlebars].', function(done) {
      engines.setEngine('hbs', engine);
      var hbs = engines.getEngine('hbs');

      var settings = {
        partials: {
          'a': 'This is A: {{upper partials.a}} - {{lower helpers.a}}',
          'b': 'This is B: {{upper partials.b}} - {{lower helpers.b}}',
          'c': 'This is C: {{upper partials.c}} - {{lower helpers.c}}'
        },
        helpers: {
          'upper': function(str) { return str.toUpperCase(); },
          'lower': function(str) { return str.toLowerCase(); }
        }
      };

      var template = [
        '{{> a }}',
        '{{> b }}',
        '{{> c }}'
      ].join('\n\n');

      var context = {
        partials: {
          a: 'Partials Context A',
          b: 'Partials Context B',
          c: 'Partials Context C'
        },
        helpers: {
          a: 'Helpers Context A',
          b: 'Helpers Context B',
          c: 'Helpers Context C'
        }
      };

      var expected = [
        'This is A: PARTIALS CONTEXT A - helpers context a',
        'This is B: PARTIALS CONTEXT B - helpers context b',
        'This is C: PARTIALS CONTEXT C - helpers context c'
      ].join('\n');

      var fn = hbs.compile(template, settings);
      hbs.render(fn, context, function(err, content) {
        content.should.equal(expected);
        done();
      });
    });
  });

  it('should render content from a compiled string:', function() {
    var lodash = require('engine-lodash');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    assert(fn(ctx) === 'Jon Schlinkert');
  });

  it('should handle errors', function() {
    var lodash = require('engine-lodash');
    var ctx = {};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    try {
      lodash.compile('<%= name %>', 'cause an error');
    } catch (err) {
      assert.equal(err.message, 'engine-cache "mergeHelpers" expected "options" to be an object.');
      return;
    }
    throw new Error('Expected an error');
  });

  it('should handle async errors', function(cb) {
    var lodash = require('engine-lodash');
    engines.setEngine('tmpl', function(str, ctx, callback) {
      try {
        var fn = lodash.compile(str);
        var res = fn(ctx);
        return callback(null, res);
      } catch (err) {
        return callback(err);
      }
    });

    var tmpl = engines.getEngine('tmpl');
    var fn = tmpl.compile('<%= name %>');
    fn(function(err, res) {
      if (err) {
        assert.equal(err.message, 'name is not defined');
        return cb();
      }
      cb(new Error('Expected an error.'));
    });
  });

  it('should directly return a compiled function:', function() {
    var lodash = require('engine-lodash');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    fn = lodash.compile(fn);
    fn = lodash.compile(fn);
    fn = lodash.compile(fn);
    assert(fn(ctx) === 'Jon Schlinkert');
  });

  it('should allow the returned function to be async:', function(cb) {
    var lodash = require('engine-lodash');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    fn(ctx, function(err, res) {
      if (err) return cb(err);
      assert(res === 'Jon Schlinkert');
      cb();
    });
  });

  it('should allow the returned function to be async and not require a context:', function(cb) {
    var lodash = require('engine-lodash');
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('No context required');
    fn(function(err, res) {
      if (err) return cb(err);
      assert(res === 'No context required');
      cb();
    });
  });

  it('should handle errors in sync render:', function(cb) {
    var lodash = require('engine-lodash');
    var ctx = {};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    try {
      var res = fn(ctx);
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'name is not defined');
      cb();
    }
  });

  it('should handle errors in async callback:', function(cb) {
    var lodash = require('engine-lodash');
    var ctx = {};
    engines.setEngine('tmpl', lodash);

    var lodash = engines.getEngine('tmpl');
    var fn = lodash.compile('<%= name %>');
    fn(ctx, function(err, res) {
      if (!err) return cb(new Error('expected an error'));
      assert(err.message === 'name is not defined');
      cb();
    });
  });
});
