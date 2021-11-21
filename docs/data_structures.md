# Data structures

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
