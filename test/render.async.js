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
var consolidate = require('consolidate');
var _engines = require('engines');

describe('engines defaults', function () {
  before(function () {
    engines.init();
  });

  describe('.render()', function () {

    it('should render content with handlebars.', function(done) {
      engines.register('hbs', consolidate.handlebars);
      var helpers = engines.helpers('hbs');
      helpers.addHelperAsync('upper', function (str, options, callback) {
        callback(null, str.toUpperCase());
      });

      var hbs = engines.get('hbs');
      hbs.render('{{upper name}}', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('JON SCHLINKERT');
        done();
      });
    });

    it('should render content with handlebars.', function(done) {
      engines.register('hbs', consolidate.handlebars);
      var helpers = engines.helpers('hbs');
      helpers.addHelperAsync('upper', function (str, options, callback) {
        callback(null, str.toUpperCase());
      });

      var hbs = engines.get('hbs');
      hbs.render('Jon: {{upper jon}}\nBrian: {{upper brian}}', {jon: 'Jon Schlinkert', brian: 'Brian Woodward'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon: JON SCHLINKERT\nBrian: BRIAN WOODWARD');
        done();
      });
    });
  });
});