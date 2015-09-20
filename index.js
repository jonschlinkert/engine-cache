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

Engines.prototype.setEngine = function (ext, fn, opts) {
  if (opts && isEngine(opts)) {
    var temp = fn;
    fn = opts;
    opts = temp;
    temp = null;
  }

  var engine = {}, msg;
  if (typeof fn !== 'object' && typeof fn !== 'function') {
    msg = expected('setEngine', 'engine').toBe(['object', 'function']);
    throw new TypeError(msg);
  }

  engine.render = fn.render || fn;

  if (fn.renderFile || fn.__express) {
    engine.renderFile = fn.renderFile || fn.__express;
  }

  // extend `engine` with any other properties on `fn`
  utils.extend(engine, fn);
  engine.options = utils.extend({}, engine.options, fn.opts, opts);

  if (typeof engine.render !== 'function' && typeof engine.renderSync !== 'function') {
    msg = expected('setEngine', 'engine').toHave(['render', 'renderSync method']);
    throw new Error(msg);
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
   * Merge the local engine helpers with the options helpers.
   *
   * @param  {Object} `options` Options passed into `render` or `compile`
   * @return {Object} Options object with merged helpers
   */

  function mergeHelpers(opts) {
    /*jshint validthis:true */
    try {
      utils.extend(this.asyncHelpers.helpers, this.helpers, opts.helpers);
      opts.helpers = this.asyncHelpers.get({wrap: opts.async});
      return opts;
    } catch(err) {
      err.message = error('mergeHelpers', err.message);
      throw new Error(err);
    }
  }

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
    var ctx = mergeHelpers.call(this, opts);
    var compiled = compile ? compile(str, ctx) : null;
    var self = this;

    return function (locals, cb) {
      if (typeof locals === 'function') {
        cb = locals;
        locals = {};
      }

      if (typeof compiled === 'function') {
        try {
          str = compiled(locals);
        } catch (err) {
          return cb(err);
        }
      }

      ctx = mergeHelpers.call(self, opts);
      var data = utils.extend({}, ctx, locals);

      if (typeof cb !== 'function') {
        return renderSync(str, data);
      }

      return render(str, data, function (err, str) {
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
   *  engine.render('<%= foo %>', {foo: 'bar'}, function (err, content) {
   *    //=> bar
   *  });
   * ```
   *
   * @param  {String|Function} `str` Original string to compile or function to use to render.
   * @param  {Object} `options` Options/locals to pass to compiled function for rendering.
   * @param {Function} `cb` Callback function that returns `err, content`.
   */

  engine.render = function wrappedRender(str, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    var fn, msg;
    if (typeof cb !== 'function') {
      msg = expected('render', 'callback').toBe('function');
      throw new TypeError(msg);
    }


    if (typeof str === 'function') {
      fn = str;
      fn(opts, cb);
      return;
    }

    if (typeof str === 'string') {
      opts.async = true;
      fn = this.compile(str, opts);
      return fn(opts, cb);
    }

    msg = expected('render', 'str').toBe(['string', 'compiled function']);
    return cb(new TypeError(msg));
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
      var fn = str;
      return fn(options);
    }

    if (typeof str !== 'string') {
      var msg = expected('renderSync', 'str').toBe(['string', 'compiled function']);
      throw new TypeError(msg);
    }

    var opts = utils.extend({}, options);
    opts.helpers = utils.merge({}, this.helpers, opts.helpers);
    str = this.compile(str, opts);
    return str(opts);
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
    var engine = engines[key];
    if (key !== 'clearCache') {
      this.setEngine(key, engine);
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

Engines.prototype.engineInspect = function (engine) {
  var inspect = ['"' + engine.name + '"'];
  inspect.push('<ext "' + engine.options.ext + '">');

  engine.inspect = function() {
    return '<Engine ' + inspect.join(' ') + '>';
  };
};

/**
 * Utils
 */

function isEngine(opts) {
  return typeof opts === 'function'
    || has(opts, 'render')
    || has(opts, 'renderSync')
    || has(opts, 'renderFile');
}

function error(method, msg) {
  return 'engine-cache "' + method + '" ' + msg;
}

function expected(method, prop) {
  var res = {};
  function msg(type, prop, args) {
    args = arrayify(args).map(function (arg, i) {
      if (i === 0) return article(arg) + ' ' + arg;
      return arg;
    }).join(' or ');
    return 'expected "' + prop + '" to ' + type + ' ' + args + '.';
  }
  res.toBe = function (args) {
    return error(method, msg('be', prop, args));
  };
  res.toHave = function (args) {
    return error(method, msg('have', prop, args));
  };
  return res;
}

function has(obj, key) {
  return obj.hasOwnProperty(key);
}

function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}

function formatExt(ext) {
  if (!ext) return;
  if (ext && ext.charAt(0) !== '.') {
    return '.' + ext;
  }
  return ext;
}

function stripExt(str) {
  if (str.charAt(0) === '.') {
    return str.slice(1);
  }
  return str;
}

function article(word) {
  var n = /^[aeiou]/.test(word);
  return n ? 'an' : 'a';
}
