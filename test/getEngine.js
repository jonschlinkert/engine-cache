'use strict';

require('should');
var assert = require('assert');
var lodash = require('engine-lodash');
var Engines = require('..');
var engines;


describe('engines get', function() {
  beforeEach(function() {
    engines = new Engines();
  });

  describe('.getEngine()', function() {
    it('should get the given engine from the `cache`.', function() {
      engines.setEngine('a', {render: function () {} });
      engines.setEngine('b', {render: function () {} });
      engines.setEngine('c', {render: function () {} });
      engines.setEngine('d', {render: function () {} });

      engines.getEngine('a').should.have.property('render');
      engines.getEngine('b').should.have.property('render');
      engines.getEngine('c').should.have.property('render');
      engines.getEngine('d').should.have.property('render');
    });

    it('should return undefined when a falsey value is passed', function() {
      assert(engines.getEngine() === undefined);
    });

    it('should get a default if defined:', function() {
      var ctx = {name: 'Jon Schlinkert'};
      engines.setEngine('*', lodash);
      var engine = engines.getEngine('tmpl');
      assert(typeof engine.render === 'function');
    });

    it('should render content with a loaded engine: lodash.', function(done) {
      var lodash = require('engine-lodash');
      var ctx = {name: 'Jon Schlinkert'};
      engines.setEngine('tmpl', lodash);

      var lodash = engines.getEngine('tmpl');
      lodash.render('<%= name %>', ctx, function (err, content) {
        content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });
});
