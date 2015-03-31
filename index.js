'use strict';

var debug = require('debug')('engine-cache');
var AsyncHelpers = require('async-helpers');
var Helpers = require('helper-cache');
var extend = require('extend-shallow');
var forOwn = require('for-own');
var async = require('async');

/**
 * Expose `Engines`
 */

module.exports = Engines;

/**
 * ```js
 * var Engines = require('engine-cache');
 * var engines = new Engines();
 * ```
 *
 * @param {Object} `engines` Optionally pass an object of engines to initialize with.
 * @api public
 */

function Engines(engines) {
  this.init(engines);
}

/**
 * Initialize default configuration.
 *
 * @api private
 */

Engines.prototype.init = function(engines) {
  debug('init %j', arguments);
  this.cache = engines || {};
};

/**
 * Register the given view engine callback `fn` as `ext`.
 *
 * ```js
 * var consolidate = require('consolidate')
 * engines.setEngine('hbs', consolidate.handlebars)
 * ```
 *
 * @param {String} `ext`
 * @param {Object|Function} `options` or callback `fn`.
 * @param {Function} `fn` Callback.
 * @return {Object} `Engines` to enable chaining.
 * @api public
 */

Engines.prototype.setEngine = function (ext, fn, options) {
  debug('[set]: %s, %j, %j', ext, fn, options);
  var engine = {};

  if (arguments.length === 3) {
    if (options && (typeof options === 'function' ||
        options.hasOwnProperty('render') ||
        options.hasOwnProperty('renderSync') ||
        options.hasOwnProperty('renderFile'))) {
      var opts = fn;
      fn = options;
      options = opts;
    }
  }

  if (typeof fn === 'function') {
    engine.render = fn.render || fn;
    if (fn.renderSync) {
      engine.renderSync = fn.renderSync;
    }
  } else if (typeof fn === 'object') {
    engine = fn || this.noop;
    engine.renderFile = fn.renderFile || fn.__express;
  }
  engine.compile = engine.compile || fn.compile;
  engine.options = engine.options || fn.options || options || {};
  engine.helpers = new Helpers(options);
  engine.asyncHelpers = new AsyncHelpers(options);

  if (typeof engine.render !== 'function' && typeof engine.renderSync !== 'function') {
    throw new Error('Engines are expected to have a `render` or `renderSync` method.');
  }

  if (engine.render) {
    engine.name = engine.render.name || 'unknown';
  } else {
    engine.name = engine.renderSync.name || 'unknown';
  }

  this.decorate(engine);

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug('[set] %s: %j', ext, engine);
  this.cache[ext] = engine;
  return this;
};

/**
 * Return the engine stored by `ext`. If no `ext`
 * is passed, the entire cache is returned.
 *
 * ```js
 * var consolidate = require('consolidate')
 * engine.setEngine('hbs', consolidate.handlebars);
 *
 * engine.getEngine('hbs');
 * // => {render: [function], renderFile: [function]}
 * ```
 *
 * @param {String} `ext` The engine to get.
 * @return {Object} The specified engine.
 * @api public
 */

Engines.prototype.getEngine = function(ext) {
  if (!ext) return this.cache;
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  var engine = this.cache[ext];
  if (!engine) {
    engine = this.cache['.*'];
  }

  return engine;
};

/**
 * Wrap engines to extend the helpers object and other
 * native methods or functionality.
 *
 * ```js
 * engines.decorate(engine);
 * ```
 *
 * @param  {Object} `engine` The engine to wrap.
 * @return {Object} The wrapped engine.
 * @api private
 */

Engines.prototype.decorate = function(engine) {
  debug('[decorate]: %j', engine);

  var renderSync = engine.renderSync;
  var render = engine.render;
  var compile = engine.compile || function (str) {
    return str;
  };

  engine.compile = function (str, opts) {
    if (typeof str === 'function') return str;
    opts = opts || {};
    return compile(str, mergeHelpers.call(this, opts));
  };

  engine.render = function(str, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof str !== 'function') {
      str = this.compile(str, options);
    }
    if (typeof str === 'function') {
      return this.resolve(str(options), cb);
    }

    var opts = extend({}, {async: true}, options);
    var self = this;
    return render.call(this, str, mergeHelpers.call(this, opts), function (err, content) {
      if (err) return cb(err);
      return self.resolve(content, cb);
    });
  };

  engine.renderSync = function(str, opts) {
    if (typeof str !== 'function') {
      str = this.compile(str, opts);
    }
    if (typeof str === 'function') {
      return str(opts);
    }

    opts = opts || {};
    opts.helpers = extend({}, this.helpers, opts.helpers);
    return renderSync(str, opts);
  };

  engine.resolve = function (str, cb) {
    var self = this;
    // `stash` contains the objects created when rendering the template
    var stashed = self.asyncHelpers.stash;
    async.eachSeries(Object.keys(stashed), function (key, next) {
      // check to see if the async ID is in the rendered string
      if (str.indexOf(key) === -1) {
        return next(null);
      }
      self.asyncHelpers.resolve(key, function (err, value) {
        if (err) return next(err);
        // replace the async ID with the resolved value
        str = str.split(key).join(value);
        next(null);
      });
    }, function (err) {
      if (err) return cb(err);
      cb(null, str);
    });
  };
};

/**
 * Load an object of engines onto the `cache`.
 * Mostly useful for testing, but exposed as
 * a public method.
 *
 * ```js
 * engines.load(require('consolidate'))
 * ```
 *
 * @param  {Object} `obj` Engines to load.
 * @return {Object} `Engines` to enable chaining.
 * @api public
 */

Engines.prototype.load = function(engines) {
  debug('[load]: %j', engines);

  for (var key in engines) {
    if (engines.hasOwnProperty(key)) {
      var engine = engines[key];
      if (key !== 'clearCache') {
        this.setEngine(key, engine);
      }
    }
  }
  return this;
};

/**
 * Get and set helpers for the given `ext` (engine). If no
 * `ext` is passed, the entire helper cache is returned.
 *
 * **Example:**
 *
 * ```js
 * var helpers = engines.helpers('hbs');
 * helpers.addHelper('foo', function() {});
 * helpers.getHelper('foo');
 * helpers.getHelper();
 * ```
 *
 * See [helper-cache] for any related issues, API details, and documentation.
 *
 * @param {String} `ext` The helper cache to get and set to.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Engines.prototype.helpers = function (ext) {
  return this.getEngine(ext).helpers;
};

/**
 * Remove `ext` engine from the cache, or if no value is
 * specified the entire cache is reset.
 *
 * **Example:**
 *
 * ```js
 * engines.clear()
 * ```
 *
 * @param {String} `ext` The engine to remove.
 * @api public
 */

Engines.prototype.clear = function(ext) {
  if (ext) {
    if (ext[0] !== '.') ext = '.' + ext;
    delete this.cache[ext];
  } else {
    this.cache = {};
  }
};

/**
 * Get helpers that match the given `async` flag.
 *
 * @param  {Object} `helpers` Helpers to filter
 * @param  {Boolean} `async` Get either async or sync helpers
 * @return {Object} Filter helpers object
 */

function filterHelpers(helpers, async) {
  var res = {};
  for (var key in helpers) {
    if (helpers.hasOwnProperty(key)) {
      if (helpers[key].async == async) {
        res[key] = helpers[key];
      }
    }
  }
  return res;
}

/**
 * Merge the local engine helpers with the options helpers.
 * Ensure only async helpers are passed to `async-helpers` for processing.
 *
 * @param  {Object} `options` Options passed into `render` or `compile`
 * @return {Object} Options object with merged helpers
 */

function mergeHelpers (options) {
  this.asyncHelpers.helpers = extend({},
    filterHelpers(this.helpers, true),
    filterHelpers(options.helpers, true));

  options.helpers = extend({},
    filterHelpers(this.helpers),
    filterHelpers(options.helpers),
    this.asyncHelpers.get({wrap: !!options.async}));
  return options;
}
