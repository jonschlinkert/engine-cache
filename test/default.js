/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Engines = require('..');
var engines;


describe('engines defaults', function () {
  beforeEach(function () {
    engines = new Engines();
  });

  describe('.getEngine()', function () {
    it('should get the default engine.', function () {
      engines.getEngine('*').should.have.property('render');
    });

    it('should render content with the default noop engine.', function () {
      engines.getEngine('*').render('<%= a %>', function(err, content) {
        content.should.equal('<%= a %>');
      });
    });

    it('should synchronously render content with the default noop engine.', function () {
      engines.getEngine('*').renderSync('foo').should.equal('foo');
    });
  });
});