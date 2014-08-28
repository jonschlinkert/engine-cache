'use strict';


var debug = require('debug')('engine-cache');
var Helpers = require('helper-cache');
var _ = require('lodash');


/**
 * ```js
 * var Engines = require('engine-cache');
 * var engines = new Engines();
 * ```
 *
 * @param {Object} `options` Default options to use.
 * @api public
 */

function Engines (engines) {
  this.engines = engines || {};
  this.init();
}


/**
 * Initialize default configuration.
 *
 * @api private
 */

Engines.prototype.init = function() {
  debug('init', arguments);
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
 *   @option {String} [options] `a` This is a
 *   @option {String} [options] `b` This is b
 *   @option {String} [options] `c` This is c
 * @param {Function} `fn` Callback.
 * @return {object} `engines` to enable chaining.
 * @api public
 */

Engines.prototype.register = function (ext, options, fn) {
  var args = [].slice.call(arguments);

  debug('[register]', arguments);
  var engine = {};

  if (args.length === 3 && typeof options === 'function') {
    var opts = fn;
    fn = options;
    options = opts;
  }

  if (args.length === 2) {
    fn = options;
    options = {};
  }

  if (typeof fn === 'function') {
    engine = fn;
    engine.render = fn.render;
  } else if (typeof fn === 'object') {
    engine = fn || this.noop;
    engine.renderFile = fn.renderFile || fn.__express;
  }

  engine.options = fn.options || options || {};
  engine.helpers = new Helpers();

  if (typeof engine.render !== 'function') {
    throw new Error('Engines are expected to have a `render` method.');
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug('[registered] %s: %j', ext, engine);
  this.engines[ext] = engine;

  return this;
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
 * @return {object} `engines` to enable chaining.
 * @api public
 */

Engines.prototype.load = function(obj) {
  debug('[load]', arguments);

  _.forIn(obj, function (value, key) {
    if (value.hasOwnProperty('render')) {
      this.register(key, value);
    }
  }, this);

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
 * Export `Engines`
 *
 * @type {Object}
 */

module.exports = Engines;