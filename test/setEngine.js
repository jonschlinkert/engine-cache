/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var assert = require('assert');
var lodash = require('engine-lodash');
var Engines = require('..');
var engines;

describe('engines set', function() {
  beforeEach(function() {
    engines = new Engines();
  });

  describe('errors', function () {
    it('should throw an error when args are invalid', function () {
      (function () {
        engines.setEngine({});
      }).should.throw('engine-cache "setEngine" expected "engine" to be an object or function.');

      (function () {
        engines.setEngine(null);
      }).should.throw('engine-cache "setEngine" expected "engine" to be an object or function.');
    });

    it('should throw an error when engine is invalid', function () {
      (function () {
        engines.setEngine('tmpl', {});
      }).should.throw('engine-cache "setEngine" expected "engine" to have a render or renderSync method.');
    });
  });

  describe('.setEngine()', function() {
    it('should cache the lodash engine.', function() {
      var ctx = {name: 'Jon Schlinkert'};
      engines.setEngine('tmpl', lodash);
      engines.getEngine('tmpl').should.have.property('render');
    });
    
    it('should set engines on the `engines` object.', function() {
      engines.setEngine('a', {render: function () {} });
      engines.setEngine('b', {render: function () {} });
      engines.setEngine('c', {render: function () {} });
      engines.setEngine('d', {render: function () {} });

      engines.cache.should.have.properties('.a', '.b', '.c', '.d');
    });

    it('should normalize engine extensions to have a dot.', function() {
      engines.setEngine('a', {render: function () {} });
      engines.setEngine('b', {render: function () {} });
      engines.setEngine('c', {render: function () {} });
      engines.setEngine('d', {render: function () {} });

      engines.cache.should.have.properties('.a', '.b', '.c', '.d');
    });

    it('should be chainable.', function() {
      engines
        .setEngine('a', {render: function () {} })
        .setEngine('b', {render: function () {} })
        .setEngine('c', {render: function () {} })
        .setEngine('d', {render: function () {} });

      engines.cache.should.have.properties('.a', '.b', '.c', '.d');
    });

    it('should allow options to be passed as the last argument.', function() {
      engines.setEngine('a', {render: function () {}}, {foo: 'bar'})
      engines.getEngine('.a').options.foo.should.be.a.string;
    });

    it('should allow options to be passed as the second argument.', function() {
      engines.setEngine('a', {foo: 'bar'}, {render: function () {}})
      engines.getEngine('.a').options.foo.should.be.a.string;
    });
  });
});
