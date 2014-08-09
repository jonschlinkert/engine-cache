'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * noop render
 */

var engine = module.exports;
engine.cache = {};


engine.renderSync = function noopRender(str) {
  try {
    return str;
  } catch (err) {
    return err;
  }
};


engine.render = function noopRender(str, options, cb) {
  try {
    cb(null, str);
  } catch (err) {
    cb(err);
  }
};


/**
 * noop renderFile
 *
 * Read a file at the given `filepath` and callback `callback(err, str)`.
 *
 * @param {String} `path`
 * @param {Object|Function} `options` or callback function.
 * @param {Function} `callback`
 * @api public
 */

engine.renderFile = function noopRenderFile(filepath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  try {
    var str;
    if (options.cache) {
      str = engine.cache[filepath] || (engine.cache[filepath] = fs.readFileSync(filepath, 'utf8'));
    } else {
      str = fs.readFileSync(filepath, 'utf8');
    }
    callback(null, engine.render(str, options, callback));
  } catch (err) {
    callback(err);
  }
};


/**
 * Express support.
 */

engine.__express = engine.renderFile;