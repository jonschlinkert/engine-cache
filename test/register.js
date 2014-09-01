/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Engines = require('..');
var engines = new Engines();

describe('engines register', function() {
  beforeEach(function() {
    engines.clear();
  });

  describe('.register()', function() {
    it('should register engines to the `engines` object.', function() {
      engines.register('a', {
        render: function () {}
      });
      engines.register('b', {
        render: function () {}
      });
      engines.register('c', {
        render: function () {}
      });
      engines.register('d', {
        render: function () {}
      });

      engines.engines.should.have.property('.a');
      engines.engines.should.have.property('.b');
      engines.engines.should.have.property('.c');
      engines.engines.should.have.property('.d');
      Object.keys(engines.engines).length.should.equal(4);
    });

    it('should normalize engine extensions to not have a dot.', function() {
      engines.register('.a', {
        render: function () {}
      });
      engines.register('.b', {
        render: function () {}
      });
      engines.register('.c', {
        render: function () {}
      });
      engines.register('.d', {
        render: function () {}
      });

      engines.engines.should.have.property('.a');
      engines.engines.should.have.property('.b');
      engines.engines.should.have.property('.c');
      engines.engines.should.have.property('.d');
      Object.keys(engines.engines).length.should.equal(4);
    });

    it('should be chainable.', function() {
      engines
        .register('a', {
          render: function () {}
        })
        .register('b', {
          render: function () {}
        })
        .register('c', {
          render: function () {}
        })
        .register('d', {
          render: function () {}
        });


      var a = engines.get('.a');
      assert.equal(typeof a, 'object');
      assert.equal(typeof a.render, 'function');

      engines.engines.should.have.property('.a');
      engines.engines.should.have.property('.b');
      engines.engines.should.have.property('.c');
      engines.engines.should.have.property('.d');
      Object.keys(engines.engines).length.should.equal(4);
    });

    it('should allow options to be passed as the last argument.', function() {
      engines
        .register('a', {render: function () {}}, {foo: 'bar'})
        .register('b', {render: function () {}}, {foo: 'bar'})
        .register('c', {render: function () {}}, {foo: 'bar'})
        .register('d', {render: function () {}}, {foo: 'bar'});

      var a = engines.get('.a');
      assert.equal(typeof a, 'object');
      assert.equal(typeof a.render, 'function');
      assert.equal(typeof a.options.foo, 'string');

      engines.engines.should.have.property('.a');
      engines.engines.should.have.property('.b');
      engines.engines.should.have.property('.c');
      engines.engines.should.have.property('.d');
      Object.keys(engines.engines).length.should.equal(4);
    });

    it('should allow options to be passed as the second argument.', function() {
      engines
        .register('a', {foo: 'bar'}, {render: function () {}})
        .register('b', {foo: 'bar'}, {render: function () {}})
        .register('c', {foo: 'bar'}, {render: function () {}})
        .register('d', {foo: 'bar'}, {render: function () {}});

      var a = engines.get('.a');
      assert.equal(typeof a, 'object');
      assert.equal(typeof a.render, 'function');
      assert.equal(typeof a.options.foo, 'string');

      engines.engines.should.have.property('.a');
      engines.engines.should.have.property('.b');
      engines.engines.should.have.property('.c');
      engines.engines.should.have.property('.d');
      Object.keys(engines.engines).length.should.equal(4);
    });
  });
});
