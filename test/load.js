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
    // engines.clear();

    /**
     * Load engine objects from `engines` in node_modules.
     * Engines must be installed individually, just like
     * consolidate.
     */

    engines.load(require('engines'));
  });

  var ctx = {name: 'Jon Schlinkert'};

  describe('.load() render', function() {
    it('should load the cache with engines.', function() {
      engines.get('lodash').should.have.property('render');
      engines.get('underscore').should.have.property('render');
      engines.get('handlebars').should.have.property('render');
      engines.get('swig').should.have.property('render');
    });

    it('should render content with a loaded engine: lodash.', function() {
      var lodash = engines.get('.lodash');
      lodash.renderSync('<%= name %>', ctx).should.equal('Jon Schlinkert');
    });

    it('should render content with a loaded engine: handlebars.', function() {
      var hbs = engines.get('handlebars');
      hbs.renderSync('{{ name }}', ctx).should.equal('Jon Schlinkert');
    });

    it('should render content with a loaded engine: swig.', function() {
      var hbs = engines.get('swig');
      hbs.renderSync('{{ name }}', ctx).should.equal('Jon Schlinkert');
    });
  });

  describe('.load() renderSync', function() {
    it('should load the cache with engines.', function() {
      engines.get('lodash').should.have.property('renderSync');
      engines.get('underscore').should.have.property('renderSync');
      engines.get('handlebars').should.have.property('renderSync');
      engines.get('swig').should.have.property('renderSync');
    });

    it('should render content with a loaded engine: lodash.', function() {
      var lodash = engines.get('lodash');
      lodash.renderSync('<%= name %>', ctx).should.equal('Jon Schlinkert');
    });

    it('should render content with a loaded engine: handlebars.', function() {
      var hbs = engines.get('handlebars');
      hbs.renderSync('{{ name }}', ctx).should.equal('Jon Schlinkert');
    });

    it('should render content with a loaded engine: swig.', function() {
      var hbs = engines.get('swig');
      hbs.renderSync('{{ name }}', ctx).should.equal('Jon Schlinkert');
    });
  });
});
