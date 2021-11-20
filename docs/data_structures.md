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
    console.log('Volume element ' + i + ' is now ' + val);
});
s.setVolume(5, 99);  // "Volume element 5 is now 99"
```
