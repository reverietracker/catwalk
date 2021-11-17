# Models

A model is a JavaScript class with a set of predefined properties, defined through a data definition language rather than explicitly through code. For example, a class definition:

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
