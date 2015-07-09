/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var Engines = require('..');
var engines = new Engines();
var consolidate = require('consolidate');


describe('engines render', function () {
  before(function () {
    engines = new Engines();
  });

  describe('.render()', function () {
    it('should error when bad args are passed.', function(done) {
      engines.setEngine('hbs', consolidate.handlebars);
      var hbs = engines.getEngine('hbs');

      hbs.render(null, function (err, content) {
        if (!err) return done(new Error('Expected an error'));
        err.message.should.equal('engine-cache `render` expects a string or function.');
        done();
      });
    });

    it('should render content with a cached engine: [handlebars].', function(done) {
      engines.setEngine('hbs', consolidate.handlebars);
      var hbs = engines.getEngine('hbs');

      hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should format engine errors.', function(done) {
      engines.setEngine('tmpl', require('engine-lodash'));
      var tmpl = engines.getEngine('tmpl');

      tmpl.render('<%= foo %>', function (err, content) {
        if (!err) return done(new Error('Expected an error'));
        // content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });
});
