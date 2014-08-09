/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var engines = require('..');

describe('engines register', function() {
  beforeEach(function() {
    engines.clear();
  });

  describe('.clear()', function() {
    it('should clear a property from the `cache` object.', function() {
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


      engines.clear('a');
      engines.cache.should.not.have.property('.a');
      engines.cache.should.have.property('.b');
      Object.keys(engines.cache).length.should.equal(3);

      engines.clear('b');
      engines.cache.should.not.have.property('.a');
      engines.cache.should.not.have.property('.b');
      Object.keys(engines.cache).length.should.equal(2);
    });
  });
});
