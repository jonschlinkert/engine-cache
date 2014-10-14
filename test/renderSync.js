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


describe('.renderSync()', function () {
  before(function () {
    engines.init();
    engines.load(require('engines'));
  });


  describe('.get()', function () {
    it('should render content with handlebars.', function() {
      engines.register('hbs', require('engines').handlebars);
      var hbs = engines.get('hbs');
      var content = hbs.renderSync('a{{letter}}c', {letter: 'b'});
      content.should.equal('abc');
    });
  });


  describe('.load()', function() {
    var ctx = {letter: 'b'};

    it('should load the cache with engines.', function() {
      engines.get('lodash').should.have.property('renderSync');
      engines.get('underscore').should.have.property('renderSync');
      engines.get('handlebars').should.have.property('renderSync');
      engines.get('swig').should.have.property('renderSync');
    });

    it('should render content with a loaded engine: lodash.', function() {
      var lodash = engines.get('lodash');
      lodash.renderSync('a<%= letter %>c', ctx).should.equal('abc');
    });

    it('should render content with a loaded engine: handlebars.', function() {
      var hbs = engines.get('handlebars');
      hbs.renderSync('a{{ letter }}c', ctx).should.equal('abc');
    });

    it('should render content with a loaded engine: swig.', function() {
      var hbs = engines.get('swig');
      hbs.renderSync('a{{ letter }}c', ctx).should.equal('abc');
    });
  });
});