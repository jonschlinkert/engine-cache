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

describe('engines defaults', function() {
  describe('.get()', function() {
    it('should get the default engine.', function() {
      engines.get('*').should.have.property('render');
    });

    it('should render content with the default engine.', function() {
      var noop = engines.get('*');
      noop.render('foo').should.equal('foo');
    });

    it('should render content with the default engine.', function() {
      var noop = engines.get('*');
      noop.render('foo').should.equal('foo');
    });
  });
});
