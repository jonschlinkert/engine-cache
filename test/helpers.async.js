/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
require('handlebars');
var Engines = require('..');
var engines = new Engines();
var consolidate = require('consolidate');

describe('async helpers', function () {
  before(function () {
    engines = new Engines();
  });

  it('should render content with handlebars.', function(done) {
    engines.setEngine('hbs', consolidate.handlebars);
    var helpers = engines.helpers('hbs');
    helpers.addAsyncHelper('upper', function (str, options, callback) {
      callback(null, str.toUpperCase());
    });

    var hbs = engines.getEngine('hbs');
    hbs.render('{{upper name}}', {name: 'foo'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('FOO');
      done();
    });
  });

  it('should render content with multiple helpers in handlebars.', function(done) {
    engines.setEngine('hbs', consolidate.handlebars);
    var helpers = engines.helpers('hbs');
    helpers.addAsyncHelper('upper', function (str, options, callback) {
      callback(null, str.toUpperCase());
    });

    var hbs = engines.getEngine('hbs');
    var ctx = {jon: 'foo', brian: 'doowb'};

    hbs.render('Jon: {{upper jon}}\nBrian: {{upper brian}}', ctx, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon: FOO\nBrian: DOOWB');
      done();
    });
  });

  it('should render content multiple times as async then sync.', function(done) {
    engines.setEngine('tmpl', require('engine-lodash'));
    var engine = engines.getEngine('tmpl');
    var ctx = {
      jon: 'foo',
      brian: 'doowb',
      helpers: {
        upper: function (str, options) {
          return str.toUpperCase();
        }
      }
    };

    engine.render('Jon: <%= upper(jon) %>\nBrian: <%= upper(brian) %>', ctx, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon: FOO\nBrian: DOOWB');

      var fn = engine.compile('Jon: <%= upper(jon) %>\nBrian: <%= upper(brian) %>', ctx);
      content = fn(ctx);
      content.should.equal('Jon: FOO\nBrian: DOOWB');
      done();
    });
  });
});
