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

describe('engines load', function() {
  beforeEach(function() {
    engines.clear();
    engines.load(require('engines'));
  });

  var ctx = {name: 'Jon Schlinkert'};

  describe('.load()', function() {
    it('should load the cache with engines.', function() {
      engines.get('lodash').should.have.property('render');
      engines.get('underscore').should.have.property('render');
      engines.get('handlebars').should.have.property('render');
      engines.get('swig').should.have.property('render');
    });

    it('should render content with a loaded engine: lodash.', function() {
      var lodash = engines.get('lodash');
      lodash.render('<%= name %>', ctx).should.equal('Jon Schlinkert');
    });

    it('should render content with a loaded engine: handlebars.', function() {
      var hbs = engines.get('handlebars');
      hbs.render('{{ name }}', ctx).should.equal('Jon Schlinkert');
    });

    it('should render content with a loaded engine: swig.', function() {
      var hbs = engines.get('swig');
      hbs.render('{{ name }}', ctx).should.equal('Jon Schlinkert');
    });
  });
});
