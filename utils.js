'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;
require('extend-shallow', 'extend');
require('mixin-deep', 'merge');
require('async-helpers', 'AsyncHelpers');
require('helper-cache', 'Helpers');
require = fn;

utils.isString = function(val) {
  return val && typeof val === 'string';
};

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

utils.formatExt = function(ext) {
  if (!utils.isString(ext)) return '';
  if (ext.charAt(0) !== '.') {
    return '.' + ext;
  }
  return ext;
};

utils.stripExt = function(str) {
  if (!utils.isString(str)) return '';
  if (str.charAt(0) === '.') {
    str = str.slice(1);
  }
  return str;
};

utils.isEngine = function(options) {
  return typeof options === 'function'
    || options.hasOwnProperty('render')
    || options.hasOwnProperty('renderSync')
    || options.hasOwnProperty('renderFile');
};

/**
 * Expose `utils`
 */

module.exports = utils;
