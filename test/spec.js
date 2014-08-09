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
var lodash = require('engine-lodash');

describe('engines', function() {
  engines.register('tmpl', lodash);

  var ctx = {
    name: 'Jon Schlinkert'
  };

  describe('.get()', function() {
    it('should cache the lodash engine.', function() {
      engines.get('tmpl').should.have.property('render');
    });

    it('should render content with a loaded engine: lodash.', function(done) {
      var lodash = engines.get('tmpl');

      lodash.render('<%= name %>', ctx, function (err, content) {
        content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });
});
