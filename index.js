'use strict';


var _ = require('lodash');


/**
 * Noop
 *
 * @api private
 * @static
 */

var noop = function(str) {
  return str;
};


/**
 * Create a new instance of `Engines`, optionally
 * passing the default `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Engines = require('engine-cache');
 * var engines = new Engines();
 * ```
 *
 * @class `Engines`
 * @param {Object} `options` Default options to use.
 * @api public
 */

function Engines (options) {
  this.options = options || {};
  this.noop = this.options.noop || '*';
  this.cache = {};

  this.defaultEngines();
}


/**
 * Load default engines
 *
 * @api private
 */

Engines.prototype.defaultEngines = function() {
  this.register('*', {
    render: noop
  });
};


/**
 * Register the given view engine callback `fn` as `ext`.
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Engines} for chaining
 * @chainable
 * @api public
 */

Engines.prototype.register = function (ext, options, fn) {
  var engine = {};

  if (arguments.length === 2) {
    fn = options;
    options = {};
  }

  if (typeof fn === 'function') {
    engine = fn;
    engine.render = fn.render;
  } else if (typeof fn === 'object') {
    engine = fn;
    engine.renderFile = fn.renderFile || fn.__express || noop;
  }

  engine.options = fn.options || options || {};

  if (typeof engine.render !== 'function') {
    throw new Error('Engines are expected to have a `render` method.');
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  this.cache[ext] = engine;
  return this;
};


/**
 * Load an object of engines onto the `cache`.
 * Mostly useful for testing, but exposed as
 * a public method.
 *
 * @param  {Object} `engines`
 * @return {Object} `Engines` to enable chaining.
 * @chainable
 * @api public
 */

Engines.prototype.load = function(engines) {
  var self = this;
  _.forIn(engines, function (value, key) {
    if (value.hasOwnProperty('render')) {
      self.register(key, value);
    }
  });

  return this;
};

/**
 * Return the engine stored by `ext`. If no `ext`
 * is passed, the entire cache is returned.
 *
 * ```js
 * var consolidate = require('consolidate');
 * engine.set('hbs', consolidate.handlebars);
 * engine.get('hbs');
 * // => {render: [function], renderFile: [function]}
 * ```
 *
 * @method get
 * @param {String} `ext` The engine to get.
 * @return {Object} The specified engine.
 * @api public
 */

Engines.prototype.get = function(ext) {
  ext = ext || this.noop;
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  var engine = this.cache[ext];
  if (!engine) {
    engine = this.cache['*'];
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
 * engines.clear();
 * ```
 *
 * @chainable
 * @method clear
 * @api public
 */

Engines.prototype.clear = function(ext) {
  if (ext) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    delete this.cache[ext];
  } else {
    this.cache = {};
  }
};


module.exports = Engines;