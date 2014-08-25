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
    it('should register engines to the `cache` object.', function() {
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

      engines.cache.should.have.property('.a');
      engines.cache.should.have.property('.b');
      engines.cache.should.have.property('.c');
      engines.cache.should.have.property('.d');
      Object.keys(engines.cache).length.should.equal(4);
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

      engines.cache.should.have.property('.a');
      engines.cache.should.have.property('.b');
      engines.cache.should.have.property('.c');
      engines.cache.should.have.property('.d');
      Object.keys(engines.cache).length.should.equal(4);
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

      engines.cache.should.have.property('.a');
      engines.cache.should.have.property('.b');
      engines.cache.should.have.property('.c');
      engines.cache.should.have.property('.d');
      Object.keys(engines.cache).length.should.equal(4);
    });
  });
});
