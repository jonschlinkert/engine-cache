'use strict';

var utils = require('./utils');

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

function Engines(engines, options) {
  this.options = options || {};
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

Engines.prototype.setEngine = function(ext, fn, opts) {
  if (opts && isEngine(opts)) {
    var temp = fn;
    fn = opts;
    opts = temp;
    temp = null;
  }

  var engine = {};
  if (typeof fn !== 'object' && typeof fn !== 'function') {
    throw new TypeError('expected an object or function');
  }

  engine.render = fn.render || fn;

  if (fn.renderFile || fn.__express) {
    engine.renderFile = fn.renderFile || fn.__express;
  }

  for (var key in fn) {
    engine[key] = fn[key];
  }

  // extend `engine` with any other properties on `fn`
  engine.options = utils.merge({}, engine.options, fn.opts, opts);

  if (typeof engine.render !== 'function' && typeof engine.renderSync !== 'function') {
    throw new Error('expected engine to have a render or renderSync method');
  }

  // create helper caches for the engine
  var AsyncHelpers = this.options.AsyncHelpers || utils.AsyncHelpers;
  var Helpers = this.options.Helpers || utils.Helpers;

  engine.helpers = new Helpers(opts);
  engine.asyncHelpers = new AsyncHelpers(opts);

  engine.name = engine.name || engine.options.name || stripExt(ext);
  engine.options.ext = formatExt(ext);

  // decorate wrapped methods for async helper handling
  this.decorate(engine);
  this.engineInspect(engine);
  this.cache[engine.options.ext] = engine;
  return this;
};

/**
 * Return the engine stored by `ext`. If no `ext`
 * is passed, undefined is returned.
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
  var engine = this.cache[formatExt(ext)];
  if (typeof engine === 'undefined' && this.options.defaultEngine) {
    if (typeof this.options.defaultEngine === 'string') {
      return this.cache[formatExt(this.options.defaultEngine)];
    } else {
      return this.options.defaultEngine;
    }
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
   * fn({foo: 'bar'}));
   * //=> BAR
   * ```
   *
   * @param  {String} `str` Original string to compile.
   * @param  {Object} `opts` Options/settings to pass to engine's compile function.
   * @return {Function} Returns render function to call that takes `locals` and optional `callback` function.
   */

  engine.compile = function wrappedCompile(str, opts) {
    if (typeof str === 'function') {
      return str;
    }

    if (!opts) opts = {};
    var helpers = mergeHelpers(engine, opts);
    var compiled = compile ? compile(str, helpers) : null;

    return function(locals, cb) {
      if (typeof locals === 'function') {
        cb = locals;
        locals = {};
      }

      if (typeof compiled === 'function') {
        try {
          str = compiled(locals);
        } catch (err) {
          if (typeof cb === 'function') {
            cb(err);
            return;
          }
          throw err;
        }
      }

      helpers = mergeHelpers(engine, opts);
      var data = {};
      if (opts && typeof opts.mergeFn === 'function') {
        data = opts.mergeFn(helpers, locals);
      } else {
        data = utils.extend({}, locals, helpers);
      }

      if (typeof cb !== 'function') {
        return renderSync(str, data);
      }

      return render(str, data, function(err, str) {
        if (err) return cb(err);
        return engine.asyncHelpers.resolveIds(str, cb);
      });
    };
  };

  /**
   * Wrapped render function for all engines loaded onto engine-cache.
   * Compiles and renders strings with given context.
   *
   * ```js
   *  engine.render('<%= foo %>', {foo: 'bar'}, function(err, content) {
   *    //=> bar
   *  });
   * ```
   *
   * @param  {String|Function} `str` Original string to compile or function to use to render.
   * @param  {Object} `options` Options/locals to pass to compiled function for rendering.
   * @param {Function} `cb` Callback function that returns `err, content`.
   */

  engine.render = function wrappedRender(str, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    if (typeof cb !== 'function') {
      throw new TypeError('expected a callback function');
    }

    if (typeof str === 'function') {
      str(locals, cb);
      return;
    }

    if (typeof str !== 'string') {
      cb(new TypeError('expected a string or compiled function'));
      return;
    }

    var async = locals.async;
    locals.async = true;

    // compile the template to create a function
    var renderFn = this.compile(str, locals);

    // call the function to render templates
    renderFn(locals, function(err, content) {
      if (err) {
        cb(err);
        return;
      }
      // reset original `async` value
      locals.async = async;
      cb(null, content);
    });
  };

  /**
   * Wrapped renderSync function for all engines loaded onto engine-cache.
   * Compiles and renders strings with given context.
   *
   * ```js
   * engine.renderSync('<%= foo %>', {foo: 'bar'});
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
    }

    if (typeof str !== 'string') {
      throw new TypeError('expected a string or compiled function');
    }

    var context = utils.extend({}, options);
    context.helpers = utils.merge({}, this.helpers, context.helpers);
    var render = this.compile(str, context);
    return render(context);
  };
};

/**
 * Merge the local engine helpers with the options helpers.
 *
 * @param  {Object} `options` Options passed into `render` or `compile`
 * @return {Object} Options object with merged helpers
 */

function mergeHelpers(engine, options) {
  if (typeof options !== 'object') {
    throw new TypeError('expected an object');
  }

  var opts = utils.merge({}, options);
  var helpers = utils.merge({}, engine.helpers, opts.helpers);
  if (typeof helpers === 'object') {
    for (var key in helpers) {
      engine.asyncHelpers.set(key, helpers[key]);
    }
  }
  opts.helpers = engine.asyncHelpers.get({wrap: opts.async});
  return opts;
}

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
    if (engines.hasOwnProperty(key) && key !== 'clearCache') {
      this.setEngine(key, engines[key]);
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
 * helpers.getEngineHelper('bar');
 * helpers.getEngineHelper();
 * ```
 *
 * See [helper-cache] for any related issues, API details, and documentation.
 *
 * @param {String} `ext` The helper cache to get and set to.
 * @return {Object} Object of helpers for the specified engine.
 * @api public
 */

Engines.prototype.helpers = function(ext) {
  return this.getEngine(ext).helpers;
};

/**
 * Decorate a custom inspect function onto the engine.
 */

Engines.prototype.engineInspect = function(engine) {
  var inspect = ['"' + engine.name + '"'];
  var exts = arrayify(engine.options.ext).join(', ');
  inspect.push('<ext "' + exts + '">');
  engine.inspect = function() {
    return '<Engine ' + inspect.join(' ') + '>';
  };
};

/**
 * Utils
 */

function isString(val) {
  return val && typeof val === 'string';
}

function isEngine(options) {
  return typeof options === 'function'
    || options.hasOwnProperty('render')
    || options.hasOwnProperty('renderSync')
    || options.hasOwnProperty('renderFile');
}

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

function formatExt(ext) {
  if (!isString(ext)) return '';
  if (ext.charAt(0) !== '.') {
    return '.' + ext;
  }
  return ext;
}

function stripExt(str) {
  if (str.charAt(0) === '.') {
    str = str.slice(1);
  }
  return str;
}
