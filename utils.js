var lazy = require('lazy-cache')(require);
lazy('mixin-deep', 'merge');
lazy('extend-shallow', 'extend');
lazy('async-helpers', 'AsyncHelpers');
lazy('helper-cache', 'Helpers');
module.exports = lazy;
