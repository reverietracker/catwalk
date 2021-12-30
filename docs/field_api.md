# roseberry internals - Field API

In a model definition such as:

```javascript
const Rectangle = Model([
    new fields.ValueField('width'),
    new fields.ValueField('height'),
]);
```

the `ValueField` (or `IntegerField`, `ListField` and so on) instances that form the definition are stored in the model class's `_meta` property - for example, `Rectangle._meta.fields.width`. These field objects manage the setting and retrieval of a model's field data, and provide the following attributes and methods:

`name`
: The field name.

`contributeToClass(cls)`
: Called once when the model class is defined to allow the field to define any accessors on the model (such as `getFoo` methods).

`set(instance, val)`
: Set the value of the field on the model instance `instance` to `val`.

`get(instance)`
: Return the value of the field on the model instance `instance`.

`getDefault()`
: Return the field's default value, used when the field is omitted from the dictionary used when creating a model instance.

`clean(val)`
: Validates that `val` is an accepted value for this field, either returning a valid final value to use or throwing a `ValidationError`.

`serialize(val)`
: Convert `val` (a valid value for this field) into data that can be serialised to JSON.

`deserialize(val)`
: Convert `val` (a value as returned from `serialize`) to a valid value for this field.

`getElement(obj, keys)`
: Given an object `obj` of the type managed by this field (e.g. an array for ListField), and a non-empty `keys` list, retrieve the element indexed by the first key in `keys`. If there are no further keys in the list, return that element; otherwise, recursively call the subfield's `getElement` method with that element and the remaining keys.

`setElement(obj, keys, val)`
: Given an object `obj` of the type managed by this field (e.g. an array for ListField), a non-empty `keys` list, and a new element value `val`: if `keys` consists of a single item, replace the element indexed by that key with `val`, and if not, retrieve the element indexed by that first key and recursively call the subfield's `setElement` method with the remaining keys.
