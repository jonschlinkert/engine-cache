/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Engines = require('..');
var engines = new Engines();

describe('engines register', function() {
  beforeEach(function() {
    engines.clear();
  });

  describe('.remove()', function() {
    it('should remove a property from the `cache` object.', function() {
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

      Object.keys(engines.cache).length.should.equal(4);

      engines.get('a').should.have.property('render');
      engines.get('b').should.have.property('render');
      engines.get('c').should.have.property('render');
      engines.get('d').should.have.property('render');
    });
  });
});
