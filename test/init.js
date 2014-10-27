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

describe('engines init', function() {
  beforeEach(function() {
    engines.clear();
  });

  describe('.defaults()', function() {
    it('should set defaults on the `options` object.', function() {
      engines.init();
      engines.engines['.*'].should.be.an.object;
    });
  });
});
