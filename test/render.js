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


describe('engines defaults', function () {
  before(function () {
    engines = new Engines();
  });

  describe('.get()', function () {

    it('should render content with handlebars.', function(done) {
      engines.register('hbs', consolidate.handlebars);
      var hbs = engines.get('hbs');

      hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });
});