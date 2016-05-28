'use strict';

require('handlebars');
var assert = require('assert');
var Engines = require('..');
var engines = new Engines();
var consolidate = require('consolidate');

describe('async helpers', function() {
  before(function() {
    engines = new Engines();
  });

  it('should render content with handlebars.', function(cb) {
    engines.setEngine('hbs', consolidate.handlebars);
    var helpers = engines.helpers('hbs');
    var hbs = engines.getEngine('hbs');
    
    helpers.addAsyncHelper('upper', function(str, options, cb) {
      cb(null, str.toUpperCase());
    });

    hbs.render('{{upper name}}', {name: 'foo'}, function(err, res) {
      if (err) return cb(err);
      assert.equal(res, 'FOO');
      cb();
    });
  });

  it('should render content with multiple helpers in handlebars.', function(cb) {
    engines.setEngine('hbs', consolidate.handlebars);
    var helpers = engines.helpers('hbs');
    var hbs = engines.getEngine('hbs');

    helpers.addAsyncHelper('upper', function(str, options, cb) {
      cb(null, str.toUpperCase());
    });

    var ctx = {jon: 'foo', brian: 'doowb'};

    hbs.render('Jon: {{upper jon}}\nBrian: {{upper brian}}', ctx, function(err, res) {
      if (err) return cb(err);

      assert.equal(res, 'Jon: FOO\nBrian: DOOWB');
      cb();
    });
  });

  it('should render content multiple times as async then sync.', function(cb) {
    engines.setEngine('tmpl', require('engine-base'));
    var engine = engines.getEngine('tmpl');
    var ctx = {
      jon: 'foo',
      brian: 'doowb',
      helpers: {
        upper: function(str, options) {
          return str.toUpperCase();
        }
      }
    };

    var fn = engine.compile('Jon: <%= upper(jon) %>\nBrian: <%= upper(brian) %>', ctx);
    var str = fn(ctx);
    assert.equal(str, 'Jon: FOO\nBrian: DOOWB');

    engine.render('Jon: <%= upper(jon) %>\nBrian: <%= upper(brian) %>', ctx, function(err, res) {
      if (err) return cb(err);
      assert.equal(res, 'Jon: FOO\nBrian: DOOWB');

      var fn = engine.compile('Jon: <%= upper(jon) %>\nBrian: <%= upper(brian) %>');
      var obj = {
        jon: 'abc',
        brian: 'xyz',
        helpers: {
          upper: function(str, options) {
            return str.toUpperCase();
          }
        }
      }
      assert.equal(fn(obj), 'Jon: ABC\nBrian: XYZ');
      cb();
    });
  });
});
