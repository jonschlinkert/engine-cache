'use strict';

require('mocha');
var assert = require('assert');
var Engines = require('..');
var engines = new Engines();
var engine = require('engine-handlebars');

describe('engines compile', function() {
  before(function() {
    engines = new Engines();
  });

  describe('.compile()', function() {
    it('should compile content with a cached engine: [handlebars].', function(cb) {
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
        if (err) return cb(err);
        assert.equal(content, expected);
        cb();
      });
    });
  });

  it('should render content from a compiled string:', function() {
    var base = require('engine-base');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    var fn = base.compile('<%= name %>');
    assert.equal(fn(ctx), 'Jon Schlinkert');
  });

  it('should handle errors', function(cb) {
    var base = require('engine-base');
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    try {
      base.compile('<%= name %>', 'cause an error');
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected settings to be an object or undefined');
      cb();
    }
  });

  it('should handle async errors', function(cb) {
    var base = require('engine-base');
    engines.setEngine('tmpl', function(str, ctx, cb) {
      try {
        cb(null, base.compile(str)(ctx));
      } catch (err) {
        cb(err);
      }
    });

    var tmpl = engines.getEngine('tmpl');
    var fn = tmpl.compile('<%= name %>');
    fn(function(err, res) {
      assert(err);
      assert.equal(err.message, 'name is not defined');
      cb();
    });
  });

  it('should directly return a compiled function:', function() {
    var base = require('engine-base');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    var fn = base.compile('<%= name %>');
    fn = base.compile(fn);
    fn = base.compile(fn);
    fn = base.compile(fn);
    assert.equal(fn(ctx), 'Jon Schlinkert');
  });

  it('should support async:', function(cb) {
    var base = require('engine-base');
    var ctx = {name: 'Jon Schlinkert'};
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    var fn = base.compile('<%= name %>');
    fn(ctx, function(err, res) {
      if (err) return cb(err);
      assert.equal(res, 'Jon Schlinkert');
      cb();
    });
  });

  it('should support async and not require a context:', function(cb) {
    var base = require('engine-base');
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    var fn = base.compile('No context required');
    fn(function(err, res) {
      if (err) return cb(err);
      assert.equal(res, 'No context required');
      cb();
    });
  });

  it('should handle errors in sync render:', function(cb) {
    var base = require('engine-base');
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    var fn = base.compile('<%= name %>');
    try {
      fn();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'name is not defined');
      cb();
    }
  });

  it('should handle errors in async callback:', function(cb) {
    var base = require('engine-base');
    engines.setEngine('tmpl', base);

    var base = engines.getEngine('tmpl');
    var fn = base.compile('<%= name %>');
    fn(null, function(err, res) {
      assert(err);
      assert.equal(err.message, 'name is not defined');
      cb();
    });
  });
});
