'use strict';

var isObject = require('isobject');
var utils = module.exports;

/**
 * Utils
 */

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

utils.isEngine = function(val) {
  if (typeof val === 'function') return true;
  if (!isObject(val)) return false;
  return val.hasOwnProperty('render')
    || val.hasOwnProperty('renderSync')
    || val.hasOwnProperty('renderFile');
};

/**
 * Expose `utils`
 */

module.exports = utils;
