/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
require('lodash');
require('underscore');
require('handlebars');
require('swig');
var assert = require('assert');
var Engines = require('..');
var engines, ctx;

describe('.renderFile()', function () {
  before(function () {
    engines = new Engines();
    engines.setEngine('tmpl', require('engine-lodash'));
    ctx = {name: 'Lo-Dash'};
  });

  it('should render content from a file', function(cb) {
    var lodash = engines.getEngine('tmpl');
    lodash.renderFile('test/fixtures/name.tmpl', ctx, function (err, res) {
      if (err) return cb(err);
      assert(res === 'Lo-Dash');
      cb();
    });
  });

  it('should support express', function(cb) {
    var lodash = engines.getEngine('tmpl');
    function tmpl() {}
    tmpl.render = lodash.render;
    tmpl.__express = lodash.renderFile;
    engines.setEngine('tmpl', tmpl);

    var engine = engines.getEngine('tmpl');

    engine.__express('test/fixtures/name.tmpl', ctx, function (err, res) {
      if (err) return cb(err);
      assert(res === 'Lo-Dash');
      cb();
    });
  });
});
