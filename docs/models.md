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

could be rewritten as a Catwalk model like this:

```javascript
const { Model, fields } = require('catwalk');

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

`NumberField`, `IntegerField` and `BooleanField` cast any values assigned to them as floats, integers or booleans respectively. Additionally, `NumberField` and `IntegerField` allow specifying a minimum and/or maximum value; values outside this range are clamped.

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
r.height = 123.5;
console.log(r.height);  // 123
r.width = 'enormous';
console.log(r.width);  // 255 - invalid assignments are discarded
r.isFilled = 'yes indeed';
console.log(r.isFilled);  // true
```

`EnumField` takes a `choices` option consisting of a list of [value, label] pairs, and validates that any value assigned to it is one of the values in the list. The field's value is the value of the selected choice, not the label.

```javascript
const Rectangle = Model([
    new fields.EnumField('color', {
        choices: [
            ['red', 'Red'],
            ['green', 'Green'],
            ['blue', 'Blue'],
        ],
    }),
    /* ... */
]);

const r = new Rectangle();
r.color = 'green';
console.log(r.color);  // 'green'
r.color = 'yellow';
console.log(r.color);  // 'green' - invalid assignments are discarded
```

## Events

A model is an [event emitter](https://nodejs.org/docs/latest/api/events.html), and every field implements a corresponding 'change' event:

```javascript
const r = new Rectangle({width: 320, height: 200});
r.on('changeWidth', (newWidth) => {
    console.log(`Width is now ${newWidth}`);
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

Models also implement a model-wide 'change' event, which is fired whenever any field changes:

```javascript
const r = new Rectangle({width: 320, height: 200});
r.on('change', (fieldName, newValue) => {
    console.log(`${fieldName} is now ${newValue}`);
});
r.width = 400;  // "width is now 400"
r.height = 300;  // "height is now 300"
```

## JSON serialisation

Models also support being serialised to JSON, via the methods `toData` (which returns a representation of the model consisting of simple JSON-serialisable data types) and `toJSON` (which serialises the model to a JSON string). These representations can be converted back to models via the class methods `fromData` and `fromJSON`.

```javascript
const r = new Rectangle({width: 320, height: 200});
const rectJSON = r.toJSON();  // '{"width": 320, "height": 200}'
const r2 = Rectangle.fromJSON(rectJSON);  // a new Rectangle instance
```
