# engine-cache [![NPM version](https://badge.fury.io/js/engine-cache.png)](http://badge.fury.io/js/engine-cache)

> express.js inspired template-engine manager.

## Install
#### Install with [npm](npmjs.org)

```bash
npm i engine-cache --save
```

## Usage

```js
var engines = require('engine-cache');
```

## API
### [Engines](index.js#L19)

* `options` **{Object}**: Default options to use.    

```js
var Engines = require('engine-cache');
var engines = new Engines();
```

### [.register](index.js#L64)

Register the given view engine callback `fn` as `ext`.

* `ext` **{String}**    
* `options` **{Object|Function}**: or callback `fn`.    
* `fn` **{Function}**: Callback.    
* `returns` **{Object}** `Engines`: to enable chaining.  

```js
var consolidate = require('consolidate')
engines.register('hbs', consolidate.handlebars)
```

### [.load](index.js#L174)

Load an object of engines onto the `cache`. Mostly useful for testing, but exposed as a public method.

* `obj` **{Object}**: Engines to load.    
* `returns` **{Object}** `Engines`: to enable chaining.  

```js
engines.load(require('consolidate'))
```

### [.get](index.js#L207)

Return the engine stored by `ext`. If no `ext` is passed, the entire cache is returned.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: The specified engine.  

```js
var consolidate = require('consolidate')
engine.set('hbs', consolidate.handlebars)
engine.get('hbs')
// => {render: [function], renderFile: [function]}
```

### [.helpers](index.js#L245)

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

### [.clear](index.js#L264)

Remove `ext` engine from the cache, or if no value is specified the entire cache is reset.

* `ext` **{String}**: The engine to remove.    

**Example:**

```js
engines.clear()
```

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 24, 2014._

[helper-cache]: https://github.com/jonschlinkert/helper-cache