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


describe('engines defaults', function () {
  before(function () {
    engines.init();
  });

  describe('.get()', function () {
    it('should get the default engine.', function () {
      engines.get('*').should.have.property('render');
    });

    it('should render content with the default engine.', function () {
      var noop = engines.get('tmpl');
      noop.render('<%= a %>', {a: 'A'}, function(err, content) {
        content.should.equal('A');
      });
    });

    it('should render content with the default engine.', function () {
      var noop = engines.get('*');
      noop.renderSync('foo').should.equal('foo');
    });

    it('should render content with the default engine.', function () {
      var noop = engines.get('tmpl');
      noop.renderSync('<%= name %>', {name: 'Jon'}).should.equal('Jon');
    });
  });
});