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
    new fields.ValueField('width', {default: 800}),
    new fields.ValueField('height', {default: 600}),
]);

const r = new Rectangle();
console.log(r.width);  // 800
```

Fields which do not have a default, and are not initialised on object creation, are assigned a value of `null`.

For all but the simplest models, you'll want to define your own object methods:

```javascript
class Rectangle extends Model([
    new fields.ValueField('width', {default: 800}),
    new fields.ValueField('height', {default: 600}),
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
    new fields.IntegerField('width', {min: 1, max: 1000}),
    new fields.IntegerField('height', {min: 1, max: 1000}),
    new fields.BooleanField('isFilled', {default: false}),
]);

const r = new Rectangle({width: 320, height: 200});
r.width = '0xff';
console.log(r.width);  // 255
r.height = 2000;
console.log(r.height);  // 1000
r.width = 'enormous';
console.log(r.width);  // 255 - invalid assignments are discarded
r.isFilled = 'yes indeed';
console.log(r.isFilled);  // true
```


## Events

A model is an [event emitter](https://nodejs.org/docs/latest/api/events.html), and every field implements a corresponding 'change' event:

```javascript
const r = new Rectangle({width: 320, height: 200});
r.on('changeWidth', (newWidth) => {
    console.log("Width is now " + newWidth);
});
r.width = 400;  // "Width is now 400"
r.width = 400;  // no output (event is only fired when the value changes)
```

The event name is formed from the capitalised field name prefixed with 'change'. To use a different name, set the `eventName` option on the field:

```javascript
const Rectangle = Model([
    new fields.IntegerField('width', {min: 1, max: 1000, eventName: 'resize'}),
]);
```


## JSON serialisation

Models also support being serialised to JSON, via the methods `toData` (which returns a representation of the model consisting of simple JSON-serialisable data types) and `toJSON` (which serialises the model to a JSON string). These representations can be converted back to models via the class methods `fromData` and `fromJSON`.

```javascript
const r = new Rectangle({width: 320, height: 200});
const rectJSON = r.toJSON();  // '{"width": 320, "height": 200}'
const r2 = Rectangle.fromJSON(rectJSON);  // a new Rectangle instance
```
