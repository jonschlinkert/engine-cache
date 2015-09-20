/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
require('lodash');
require('underscore');
require('handlebars');
require('swig');
var assert = require('assert');
var Engines = require('..');
var engines, ctx;

describe('.renderSync()', function () {
  before(function () {
    engines = new Engines();
    engines.load(require('engines'));
    ctx = {letter: 'b'};
  });

  describe('errors', function () {
    it('should throw an error when args are invalid', function () {
      var lodash = engines.getEngine('lodash');
      (function () {
        lodash.renderSync({});
      }).should.throw('engine-cache "renderSync" expected "str" to be a string or compiled function.');

      (function () {
        lodash.renderSync(null);
      }).should.throw('engine-cache "renderSync" expected "str" to be a string or compiled function.');
    });
  });

  describe('cached engines', function () {
    it('should render content using a cached engine: [handlebars]', function() {
      engines.setEngine('hbs', require('engines').handlebars);
      var hbs = engines.getEngine('hbs');
      var content = hbs.renderSync('a{{letter}}c', {letter: 'b'});
      assert(content === 'abc');
    });

    it('should render content from a string', function() {
      var lodash = engines.getEngine('lodash');
      assert(lodash.renderSync('a<%= letter %>c', ctx) === 'abc');
    });

    it('should render from a compiled function', function() {
      var lodash = engines.getEngine('lodash');
      var fn = lodash.compile('a<%= letter %>c');
      assert(lodash.renderSync(fn, ctx) === 'abc');
    });

    it('should render content with handlebars', function() {
      var hbs = engines.getEngine('handlebars');
      assert(hbs.renderSync('a{{ letter }}c', ctx) === 'abc');
    });

    it('should render content with handlebars', function() {
      var hbs = engines.getEngine('handlebars');
      assert(hbs.renderSync('a{{ letter }}c', ctx) === 'abc');
    });

    it('should render content with swig', function() {
      var hbs = engines.getEngine('swig');
      assert(hbs.renderSync('a{{ letter }}c', ctx) === 'abc');
    });
  });
});
