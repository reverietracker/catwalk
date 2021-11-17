# Models

A model is a JavaScript class with a set of predefined properties ('fields'), defined through a data definition language rather than explicitly through code. For example, a class definition:

```javascript
class Rectangle {
    constructor({width, height}) {
        this.width = width;
        this.height = height;
    }
}

const r = new Rectangle({width: 320, height: 200})
```

could be rewritten as a roseberry model like this:

```javascript
const { Model, fields } = require('roseberry');

const Rectangle = Model([
    new fields.ValueField('width'),
    new fields.ValueField('height'),
]);

const r = new Rectangle({width: 320, height: 200})
```

Fields can have default values:

```javascript
const Rectangle = Model([
    new fields.ValueField('width', {'default': 800}),
    new fields.ValueField('height', {'default': 600}),
]);

const r = new Rectangle()
console.log(r.width)  # 800
```

Fields which do not have a default, and are not initialised on object creation, are assigned a value of `null`.
