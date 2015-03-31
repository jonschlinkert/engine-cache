# engine-cache [![NPM version](https://badge.fury.io/js/engine-cache.svg)](http://badge.fury.io/js/engine-cache)

> express.js inspired template-engine manager.

## Install with [npm](npmjs.org)

```bash
npm i engine-cache --save
```

## Usage

```js
var Engines = require('engine-cache');
```

## API
### [Engines](./index.js#L26)

* `engines` **{Object}**: Optionally pass an object of engines to initialize with.    

```js
var Engines = require('engine-cache');
var engines = new Engines();
```

### [.setEngine](./index.js#L56)

Register the given view engine callback `fn` as `ext`.

* `ext` **{String}**    
* `options` **{Object|Function}**: or callback `fn`.    
* `fn` **{Function}**: Callback.    
* `returns` **{Object}** `Engines`: to enable chaining.  

```js
var consolidate = require('consolidate')
engines.setEngine('hbs', consolidate.handlebars)
```

### [.getEngine](./index.js#L123)

Return the engine stored by `ext`. If no `ext` is passed, the entire cache is returned.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: The specified engine.  

```js
var consolidate = require('consolidate')
engine.setEngine('hbs', consolidate.handlebars);

engine.getEngine('hbs');
// => {render: [function], renderFile: [function]}
```

### [.load](./index.js#L235)

Load an object of engines onto the `cache`. Mostly useful for testing, but exposed as a public method.

* `obj` **{Object}**: Engines to load.    
* `returns` **{Object}** `Engines`: to enable chaining.  

```js
engines.load(require('consolidate'))
```

### [.helpers](./index.js#L269)

Get and set helpers for the given `ext` (engine). If no `ext` is passed, the entire helper cache is returned.

* `ext` **{String}**: The helper cache to get and set to.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

**Example:**

```js
var helpers = engines.helpers('hbs');
helpers.addHelper('foo', function() {});
helpers.getHelper('foo');
helpers.getHelper();
```

See [helper-cache] for any related issues, API details, and documentation.

### [.clear](./index.js#L287)

Remove `ext` engine from the cache, or if no value is specified the entire cache is reset.

* `ext` **{String}**: The engine to remove.    

**Example:**

```js
engines.clear()
```

## Related
 * [helper-cache](https://github.com/jonschlinkert/helper-cache): Easily register and get helper functions to be passed to any template engine or node.js application. Methods for both sync and async helpers.
 * [async-helpers](https://github.com/doowb/async-helpers): Use async helpers in template engines like Handlebars and Lodash.
 * [template](https://github.com/jonschlinkert/template): Render templates from any engine. Make custom template types, use layouts on pages, partials or any custom template type, custom delimiters, helpers, middleware, routes, loaders, and lots more. Powers Assemble v0.6.0, Verb v0.3.0 and your application.
 * [template-helpers](https://github.com/jonschlinkert/template-helpers): Generic JavaScript helpers that can be used with any template engine. Handlebars, Lo-Dash, Underscore, or any engine that supports helper functions.
 * [handlebars-helpers](https://github.com/assemble/handlebars-helpers): 120+ Handlebars helpers in ~20 categories, for Assemble, YUI, Ghost or any Handlebars project. Includes helpers like {{i18}}, {{markdown}}, {{relative}}, {{extend}}, {{moment}}, and so on.

## Running tests
Install dev dependencies:

```bash
npm i -d && npm test
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/engine-cache/issues)

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014-2015 Jon Schlinkert  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on March 31, 2015._

[helper-cache]: https://github.com/jonschlinkert/helper-cache
<!-- deps: swig lodash mocha engine-lodash handlebars -->
