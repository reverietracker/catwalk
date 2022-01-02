# Data structures

## ListField

So far, the fields we've looked at only hold single values. We can also store arrays of values using `ListField`:

```javascript
const { Model, fields } = require('roseberry');

const Sample = Model([
    new fields.ListField(
        'volumes', new fields.IntegerField('volume', {default: 0, max: 255}), 8
    ),
]);

const s = new Sample({volumes: [1, 2, 4, 8, 12, 24, 48, 96]});
```

Arrays defined with `ListField` are fixed length; the second parameter gives the type of an element, and the third parameter gives the array length.

Using standard array notation to access array elements (e.g. `s.volumes[2]`) will work, but this will bypass any validation checks. Instead, you should use the methods `getVolume` and `setVolume`; these methods are defined automatically based on the field name for an individual element ('volume' here).

```javascript
console.log(s.getVolume(5));  // 24
s.setVolume(5, 32);
console.log(s.getVolume(5));  // 32
s.setVolume(5, 999);
console.log(s.getVolume(5));  // 255
```

Like other field types, `ListField` implements a change event; event listeners are passed the index of the changed element, and its new value.

```javascript
s.on('changeVolume', (i, val) => {
    console.log(`Volume element ${i} is now ${val}`);
});
s.setVolume(5, 99);  // "Volume element 5 is now 99"
```

Elements within ListField can be any field type, including ListField itself:

```javascript
const Sprite = Model([
    new fields.ListField(
        'bitmap',
        new fields.ListField('row', new fields.BooleanField('col'), 8),
        8,
        {elementName: 'pixel'}
    ),
]);

smiley = new Sprite({
    'bitmap': [
        // 0/1 used here for legibility, but these will be cast to true/false by BooleanField
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ]
})
```

Setting `{elementName: 'pixel'}` in the above definition means that the getter / setter functions will be named `getPixel` and `setPixel`, and the change event will be named `changePixel`. (Otherwise, the name `row` would be used, giving `getRow`, `setRow` and `changeRow`.)

For accessing individual elements, the getter and setter methods generalise to any number of arguments:

```javascript
console.log(smiley.getPixel(2, 5));  // false - pixel 5 of row 2
smiley.setPixel(2, 5, true);
```

Likewise, when a change event is fired, event listeners will be passed as many arguments as required to identify the changed element:

```javascript
smiley.on('changePixel', (row, col, newVal) => {
    console.log(`pixel (${row}, ${col}) changed to ${newVal}`);
});
```

## StructField

A `StructField` allows storing a group of fields, potentially of different types, to be retrieved either as a dictionary or individually. It can also be nested inside ListField (and vice versa):

```javascript
const { Model, fields } = require('roseberry');

const Polygon = Model([
    new fields.ListField(
        'vertices', new fields.StructField('vertex', [
            new fields.IntegerField('x'),
            new fields.IntegerField('y'),
        ]), 3
    ),
]);

const p = new Polygon({vertices: [
    {x: 0, y: 0},
    {x: 4, y: 0},
    {x: 0, y: 3},
]});

console.log(s.getVertex(1));  // {x: 4, y: 0}
console.log(s.getVertex(1, 'x'));  // 4
```

## TupleField

`TupleField` is similar to `StructField`, but the sub-fields within it are managed as an array and referenced by index rather than name:

```javascript
const { Model, fields } = require('roseberry');

const Polygon = Model([
    new fields.ListField(
        'vertices', new fields.TupleField('vertex', [
            new fields.IntegerField('x'),
            new fields.IntegerField('y'),
        ]), 3
    ),
]);

const p = new Polygon({vertices: [
    [0, 0],
    [4, 0],
    [0, 3],
]});

console.log(s.getVertex(1));  // [4, 0]
console.log(s.getVertex(1, 0));  // 4
```

The sub-fields within a TupleField are assigned names like any other field, but these names are unused and do not need to be unique.

## ModelField

A `ModelField` holds a reference to an instance of a given model.

```javascript
const { Model, fields } = require('roseberry');

const Polygon = Model([
    new fields.ListField(
        'vertices', new fields.TupleField('vertex', [
            new fields.IntegerField('x'),
            new fields.IntegerField('y'),
        ]), 3
    ),
]);

const Scene = Model([
    new fields.ListField(
        'polygons', new fields.ModelField('polygon', Polygon), 3
    )
]);

scene = new Scene({
    'polygons': [
        new Polygon({'vertices': [0, 0], [4, 0], [0, 3]}),
        new Polygon({'vertices': [1, 1], [5, 1], [1, 4]}),
        new Polygon({'vertices': [2, 2], [6, 2], [2, 5]}),
    ]
});
```

Note: It is possible to create circular references using `ModelField`, but the `toJSON` method has no mechanism to detect these, and serialising them will fail with an infinite recursion.
