/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('lodash');
require('underscore');
require('handlebars');
require('swig');
var assert = require('assert');
var Engines = require('..');
var engines, ctx;

describe('.renderSync()', function() {
  before(function() {
    engines = new Engines();
    engines.setEngines(require('engines'));
    ctx = {letter: 'b'};
  });

  describe('errors', function() {
    it('should throw an error when args are invalid', function(cb) {
      var engine = engines.getEngine('lodash');
      try {
        engine.renderSync({});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'expected a string or compiled function');
      }

      try {
        engine.renderSync();
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'expected a string or compiled function');
      }
      cb();
    });
  });

  describe('cached engines', function() {
    it('should render content using a cached engine: [handlebars]', function() {
      engines.setEngine('hbs', require('engines').handlebars);
      var engine = engines.getEngine('hbs');
      var content = engine.renderSync('a{{letter}}c', {letter: 'b'});
      assert.equal(content, 'abc');
    });

    it('should render content from a string', function() {
      var lodash = engines.getEngine('lodash');
      assert.equal(lodash.renderSync('a<%= letter %>c', ctx), 'abc');
    });

    it('should render from a compiled function', function() {
      var lodash = engines.getEngine('lodash');
      var fn = lodash.compile('a<%= letter %>c');
      assert.equal(lodash.renderSync(fn, ctx), 'abc');
    });

    it('should render content with handlebars', function() {
      var hbs = engines.getEngine('handlebars');
      assert.equal(hbs.renderSync('a{{ letter }}c', ctx), 'abc');
    });

    it('should render content with handlebars', function() {
      var hbs = engines.getEngine('handlebars');
      assert.equal(hbs.renderSync('a{{ letter }}c', ctx), 'abc');
    });

    it('should render content with swig', function() {
      var hbs = engines.getEngine('swig');
      assert.equal(hbs.renderSync('a{{ letter }}c', ctx), 'abc');
    });
  });
});
