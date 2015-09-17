'use strict';

var lazy = require('lazy-cache')(require);
lazy('extend-shallow', 'extend');
lazy('async-helpers', 'AsyncHelpers');
lazy('helper-cache', 'Helpers');

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
  this.cache = engines || {};
}

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
  var engine = {};
  if (arguments.length === 3) {
    if (options && (typeof options === 'function' ||
        options.hasOwnProperty('render') ||
        options.hasOwnProperty('renderSync') ||
        options.hasOwnProperty('renderFile'))) {
      var opts = fn;
      fn = options;
      options = opts;
      opts = null;
    }
  }

  var type = typeof fn;
  if (type !== 'object' && type !== 'function') {
    throw new TypeError('engine-cache expects engines to be an object or function.');
  }

  engine.render = fn.render || fn;
  if (fn.renderFile) {
    engine.renderFile = fn.renderFile;
  }
  if (fn.__express) {
    engine.renderFile = fn.__express;
  }
  for (var key in fn) {
    engine[key] = fn[key];
  }

  engine.options = lazy.extend({}, engine.options, fn.options, options);
  engine.helpers = new lazy.Helpers(options);
  engine.asyncHelpers = new lazy.AsyncHelpers(options);

  if (typeof engine.render !== 'function' && typeof engine.renderSync !== 'function') {
    throw new Error('Engines are expected to have a `render` or `renderSync` method.');
  }

  if (!engine.name && engine.render) {
    engine.name = engine.render.name;
  }

  if (!engine.name && engine.renderSync) {
    engine.name = engine.renderSync.name;
  }

  this.decorate(engine);
  if (ext.charAt(0) !== '.') {
    ext = '.' + ext;
  }

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
  if (!ext) return;
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
  var renderSync = engine.renderSync;
  var render = engine.render;
  var compile = engine.compile;

  /**
   * Wrapped compile function for all engines loaded onto engine-cache.
   * If possible, compiles the string with the original engine's compile function.
   * Returns a render function that will either use the original engine's compiled function
   * or the `render/renderSync` methods and will resolve async helper ids.
   *
   * ```js
   * var fn = engine.compile('<%= upper(foo) %>', {imports: {'upper': upper}});
   * console.log(fn({foo: 'bar'})));
   * //=> BAR
   * ```
   *
   * @param  {String} `str` Original string to compile.
   * @param  {Object} `opts` Options/settings to pass to engine's compile function.
   * @return {Function} Returns render function to call that takes `locals` and optional `callback` function.
   */

  engine.compile = function wrappedCompile(str, opts) {
    if (typeof str === 'function') return str;
    opts = opts || {};
    var fn = compile && compile(str, mergeHelpers.call(this, opts));
    return function (locals, cb) {
      var content = str;
      if (typeof fn === 'function') {
        // already compiled
        try {
          content = fn(locals);
        } catch (err) {
          if (typeof cb === 'function') return cb(err);
          throw err;
        }
        if (typeof cb !== 'function') {
          return content;
        } else {
          return engine.asyncHelpers.resolveIds(content, cb);
        }
      } else {
        var ctx = lazy.extend({}, mergeHelpers.call(this, opts), locals);
        if (typeof cb !== 'function') {
          return renderSync(content, ctx);
        } else {
          return render(content, ctx, function (err, content) {
            if (err) return cb(err);
            if (content instanceof Error) {
              return cb(content);
            }
            return engine.asyncHelpers.resolveIds(content, cb);
          });
        }
      }
    }.bind(this);
  };

  /**
   * Wrapped render function for all engines loaded onto engine-cache.
   * Compiles and renders strings with given context.
   *
   * ```js
   *  engine.render('<%= foo %>', {foo: 'bar'}, function (err, content) {
   *    console.log(content);
   *  });
   * //=> bar
   * ```
   *
   * @param  {String|Function} `str` Original string to compile or function to use to render.
   * @param  {Object} `options` Options/locals to pass to compiled function for rendering.
   * @param {Function} `cb` Callback function that returns `err, content`.
   */

  engine.render = function wrappedRender(str, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof cb !== 'function') {
      throw new TypeError('engine-cache `render` expects a callback function.');
    }

    if (typeof str === 'function') {
      return str(options, cb);
    } else if (typeof str === 'string') {
      var opts = lazy.extend({async: true}, options);
      str = this.compile(str, opts);
      return str(opts, cb);
    }
    return cb(new TypeError('engine-cache `render` expects a string or function.'));
  };

  /**
   * Wrapped renderSync function for all engines loaded onto engine-cache.
   * Compiles and renders strings with given context.
   *
   * ```js
   * console.log(engine.renderSync('<%= foo %>', {foo: 'bar'}));
   * //=> bar
   * ```
   *
   * @param  {String|Function} `str` Original string to compile or function to use to render.
   * @param  {Object} `options` Options/locals to pass to compiled function for rendering.
   * @return {String} Returns rendered content.
   */

  engine.renderSync = function wrappedRenderSync(str, options) {
    if (typeof str === 'function') {
      return str(options);
    } else if (typeof str === 'string') {
      var opts = lazy.extend({}, options);
      opts.helpers = lazy.extend({}, this.helpers, opts.helpers);
      str = this.compile(str, opts);
      return str(opts);
    }
    throw new TypeError('engine-cache `renderSync` expects a string or function.');
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
 * helpers.addHelper('bar', function() {});
 * helpers.getHelper('bar');
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
    if (ext && ext.charAt(0) !== '.') ext = '.' + ext;
    delete this.cache[ext];
  } else {
    this.cache = {};
  }
};

/**
 * Merge the local engine helpers with the options helpers.
 *
 * @param  {Object} `options` Options passed into `render` or `compile`
 * @return {Object} Options object with merged helpers
 */

function mergeHelpers (opts) {
  lazy.extend(this.asyncHelpers.helpers, this.helpers, opts.helpers);
  opts.helpers = this.asyncHelpers.get({wrap: opts.async});
  return opts;
}
