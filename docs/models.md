# Models

A model is a JavaScript class with a set of predefined properties ('fields'), defined through a data definition language rather than explicitly through code. For example, a class definition:

```javascript
class Rectangle {
    constructor({width, height}) {
        this.width = width;
        this.height = height;
    }
}

const r = new Rectangle({width: 320, height: 200});
```

could be rewritten as a roseberry model like this:

```javascript
const { Model, fields } = require('roseberry');

const Rectangle = Model([
    new fields.ValueField('width'),
    new fields.ValueField('height'),
]);

const r = new Rectangle({width: 320, height: 200});
```

Fields can have default values:

```javascript
const Rectangle = Model([
    new fields.ValueField('width', {'default': 800}),
    new fields.ValueField('height', {'default': 600}),
]);

const r = new Rectangle();
console.log(r.width);  // 800
```

Fields which do not have a default, and are not initialised on object creation, are assigned a value of `null`.

For all but the simplest models, you'll want to define your own object methods:

```javascript
class Rectangle extends Model([
    new fields.ValueField('width', {'default': 800}),
    new fields.ValueField('height', {'default': 600}),
]) {
    getArea() {
        return this.width * this.height;
    }
}

const r = new Rectangle({width: 320, height: 200});
console.log(r.getArea());  // 64000
```

This works because `Model` is a function that takes a definition of fields and returns a class.


## Typed fields

`IntegerField` and `BooleanField` cast any values assigned to them as integers or booleans respectively. Additionally, `IntegerField` allows specifying a minimum and/or maximum value; values outside this range are clamped.

```javascript
const Rectangle = Model([
    new fields.IntegerField('width', {'min': 1, 'max': 1000}),
    new fields.IntegerField('height', {'min': 1, 'max': 1000}),
    new fields.BooleanField('isFilled', {'default': false}),
]);

const r = new Rectangle({'width': 320, 'height': 200});
r.width = '0xff';
console.log(r.width);  // 255
r.height = 2000;
console.log(r.height);  // 1000
r.width = 'enormous';
console.log(r.width);  // 255 - invalid assignments are discarded
r.isFilled = 'yes indeed';
console.log(r.isFilled);  // true
```
