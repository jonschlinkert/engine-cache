'use strict';


var _ = require('lodash');
var debug = require('debug')('engine-cache');


/**
 * ```js
 * var engines = require('engine-cache')
 * ```
 *
 * @method `engines`
 * @param {Object} `options` Default options to use.
 * @api public
 */

function engines (options) {
  engines.init(options);
  return engines;
}


/**
 * Options cache
 *
 * @type {Object}
 */

engines.options = {};


/**
 * Engine cache
 *
 * @type {Object}
 */

engines.cache = {};


/**
 * Initialize defaults.
 *
 * @api private
 */

engines.init = function(opts) {
  debug('init', arguments);
  this.options = {};
  this.cache = {};
  this.defaultEngines();
  this.extend(opts);
};


/**
 * Load default engines
 *
 * @api private
 */

engines.defaultEngines = function() {
  debug('defaultEngines', arguments);
  this.register('tmpl', require('./defaults/lodash'));
  this.register('*', require('./defaults/noop'));
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
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {engines} to enable chaining.
 * @api public
 */

engines.register = function (ext, options, fn) {
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

  if (typeof engine.render !== 'function') {
    throw new Error('Engines are expected to have a `render` method.');
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug('[registered] %s: %j', ext, engine);

  this.cache[ext] = engine;
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
 * @return {engines} to enable chaining.
 * @api public
 */

engines.load = function(obj) {
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
 * @method get
 * @param {String} `ext` The engine to get.
 * @return {Object} The specified engine.
 * @api public
 */

engines.get = function(ext) {
  if (!ext) {
    return this.cache;
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  var noop = this.noop || '*';
  if (noop[0] !== '.') {
    noop = '.' + noop;
  }

  var engine = this.cache[ext] || this.cache[noop];
  if (!engine) {
    engine = this.cache['.*'];
  }
  return engine;
};


/**
 * Remove `ext` from the cache, or if no value is
 * specified the entire cache is reset.
 *
 * **Example:**
 *
 * ```js
 * engines.clear()
 * ```
 *
 * @chainable
 * @method clear
 * @api public
 */

engines.clear = function(ext) {
  if (ext) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    delete this.cache[ext];
  } else {
    this.cache = {};
  }
};


/**
 * Set or get an option.
 *
 * ```js
 * engines.option('a', true)
 * engines.option('a')
 * // => true
 * ```
 *
 * @method option
 * @param {String} `key`
 * @param {*} `value`
 * @return {engines} to enable chaining.
 * @api public
 */

engines.option = function(key, value) {
  var args = [].slice.call(arguments);

  if (args.length === 1 && typeof key === 'string') {
    return this.options[key];
  }

  if (typeof key === 'object') {
    _.extend.apply(_, [this.options].concat(args));
    return this;
  }

  this.options[key] = value;
  return this;
};


/**
 * Extend the options with the given `obj`.
 *
 * ```js
 * engines.extend({a: 'b'})
 * engines.option('a')
 * // => 'b'
 * ```
 *
 * @method extend
 * @param {Object} `obj`
 * @return {engines} to enable chaining.
 * @api public
 */

engines.extend = function(obj) {
  this.options = _.extend({}, this.options, obj);
  return this;
};


module.exports = engines;