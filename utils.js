'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;
require('extend-shallow', 'extend');
require('mixin-deep', 'merge');
require('async-helpers', 'AsyncHelpers');
require('helper-cache', 'Helpers');
require = fn;

/**
 * Expose `utils`
 */

module.exports = utils;
