# Catwalk

Catwalk is a framework for JavaScript web apps that need to present a UI for managing complex structured data.

The `catwalk` package provides the model layer of the framework. In Catwalk, a model is a JavaScript class with a set of fields defined on it, which may be simple values such as strings or integers, or data structures such as arrays. Fields can have validation applied, and model state can be serialised and deserialised to and from JSON. Most importantly, each field provides a 'change' event that a UI component can listen to, allowing the UI to be efficiently kept in sync with the model.

## A simple example

```javascript
class Rectangle extends Model([
    new fields.IntegerField('width', {min: 1, max: 1000}),
    new fields.IntegerField('height', {min: 1, max: 1000}),
    new fields.ValueField('color'),
]) {
    getArea() {
        return this.width * this.height;
    }
}

const rect = new Rectangle({width: 320, height: 200, color: 'red'});
rect.on('changeWidth', (w) => console.log('width is now', w));
rect.width = 640;
```

## Why not React?

Catwalk and React follow broadly the same principles: your UI layer is a window onto a data model, and when the state of that data model changes, the UI has to change to reflect that state change. In React, the standard way of working is for a UI component to implement a 'render' method that generates the HTML representation for the new state in full; React then uses its internal magic to only update the parts of the DOM that have changed from the previous state.

This is less ideal when the UI component is a data grid managing potentially hundreds of data values, and changes are frequent - a change to a single value means that the HTML for the entire grid structure has to be generated, and then React has to scan though it to find the one item that has changed. These internal optimisations in React do at least ensure that we don't need to rebuild the browser DOM on every change - but to anyone familiar with O(n) notation, this still feels Wrong. Nothing should ever have to loop over an array just to update a single item.

In Catwalk, changing one item in an array will trigger a change event that the UI layer can respond to efficiently. In short - if you find that React has too much magic, Catwalk might be for you.
