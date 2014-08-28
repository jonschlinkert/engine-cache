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

      var helpers = engines.helpers('a');
      helpers.set('foo', function() {});
      var foo = helpers.get('foo');

      helpers.get('foo').should.be.a.function;
    });
  });
});
