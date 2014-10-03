/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies
 */

var debug = require('debug')('engine-cache');
var Helpers = require('helper-cache');
var merge = require('mixin-deep');
var forOwn = require('for-own');
var typeOf = require('kind-of');
var hasAny = require('has-any');


/**
 * ```js
 * var Engines = require('engine-cache');
 * var engines = new Engines();
 * ```
 *
 * @param {Object} `engines` Default `engines` object to use for initialization.
 * @api public
 */

function Engines (engines) {
  this.init(engines);
}


/**
 * Initialize default configuration.
 *
 * @api private
 */

Engines.prototype.init = function(engines) {
  debug('init', arguments);
  this.engines = engines || {};
  this.defaultEngines();
};


/**
 * Load default engines
 *
 * @api private
 */

Engines.prototype.defaultEngines = function() {
  debug('defaultEngines', arguments);
  this.register('*', require('engine-noop'));
};


/**
 * Register the given view engine callback `fn` as `ext`.
 *
 * ```js
 * var consolidate = require('consolidate')
 * engines.register('hbs', consolidate.handlebars)
 * ```
 *
 * @param {String} `ext`
 * @param {Object|Function} `options` or callback `fn`.
 * @param {Function} `fn` Callback.
 * @return {Object} `Engines` to enable chaining.
 * @api public
 */

Engines.prototype.register = function (ext, fn, options) {
  var args = [].slice.call(arguments).filter(Boolean);

  debug('[register]', arguments);

  if (args.length === 3) {
    if (options && (typeof options === 'function' || hasAny(options, ['render', 'renderFile']))) {
      var opts = fn;
      fn = options;
      options = opts;
    }
  }

  var engine = {};

  if (typeof fn === 'function') {
    engine = fn;
  } else if (isObject(fn)) {
    engine = fn;
    engine.renderSync = fn.renderSync;
    engine.renderFile = fn.renderFile || fn.__express;
  }

  engine.options = engine.options || fn.options || options || {};
  engine.helpers = new Helpers(options);

  if (typeof engine.render !== 'function' && typeof engine.renderSync !== 'function') {
    throw new Error('Engines are expected to have a `render` or `renderSync` method.');
  }

  this.wrapEngine(engine);

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug('[registered] %s: %j', ext, engine);
  this.engines[ext] = engine;

  return this;
};


/**
 * Wrap engines to extend the helpers object and other
 * native methods or functionality.
 *
 * ```js
 * engines.wrapEngine(engine);
 * ```
 *
 * @param  {Object} `engine` The engine to wrap.
 * @return {Object} The wrapped engine.
 * @api public
 */

Engines.prototype.wrapEngine = function(engine) {
  debug('[wrapEngine]', arguments);
  var render = engine.render;

  engine.render = function(str, options, callback) {
    if (isFunction(options)) {
      callback = options;
      options = {};
    }

    var opts = merge({}, options);
    opts.helpers = merge({}, engine.helpers, opts.helpers);

    return render.call(this, str, opts, function (err, content) {
      if (err) {
        callback(err);
        return;
      }
      return engine.helpers.resolve(content, callback);
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

Engines.prototype.load = function(obj) {
  debug('[load]', arguments);

  forOwn(obj, function (value, key) {
    if (hasOwn(value, 'render') || hasOwn(value, 'renderSync')) {
      this.register(key, value);
    }
  }.bind(this));

  return this;
};


/**
 * Return the engine stored by `ext`. If no `ext`
 * is passed, the entire cache is returned.
 *
 * ```js
 * var consolidate = require('consolidate')
 * engine.set('hbs', consolidate.handlebars)
 * engine.get('hbs')
 * // => {render: [function], renderFile: [function]}
 * ```
 *
 * @param {String} `ext` The engine to get.
 * @return {Object} The specified engine.
 * @api public
 */

Engines.prototype.get = function(ext) {
  if (!ext) {
    return this.engines;
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  var engine = this.engines[ext];
  if (!engine) {
    engine = this.engines['.*'];
  }

  return engine;
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
  return this.get(ext).helpers;
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
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    delete this.engines[ext];
  } else {
    this.engines = {};
  }
};


/**
 * Utilities for returning the native `typeof` a value.
 *
 * @api private
 */

function isFunction(value) {
  return typeOf(value) === 'function';
}

function isObject(value) {
  return typeOf(value) === 'object';
}

function isArray(value) {
  return Array.isArray(value);
}

function isString(value) {
  return typeOf(value) === 'string';
}

function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
}


/**
 * Expose `Engines`
 */

module.exports = Engines;