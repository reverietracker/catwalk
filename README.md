# roseberry

`roseberry` is a framework for JavaScript web apps that need to present a UI for managing complex structured data.

## Why not React?

roseberry and React follow broadly the same principles: your UI layer is a window onto a data model, and when the state of that data model changes, the UI has to change to reflect that state change. In React, the standard way of working is for a UI component to implement a 'render' method that generates the HTML representation for the new state in full; React then uses its internal magic to only update the parts of the DOM that have changed from the previous state.

This is less ideal when the UI component is a data grid managing potentially hundreds of data values, and changes are frequent - a change to a single value means that the HTML for the entire grid structure has to be generated, and then React has to scan though it to find the one item that has changed. These internal optimisations in React do at least ensure that we don't need to rebuild the browser DOM on every change - but to anyone familiar with O(n) notation, this still feels Wrong. Nothing should ever have to loop over an array just to update a single item.

In roseberry, changing one item in an array will trigger a change event that the UI layer can respond to efficiently. In short - if you find that React has too much magic, roseberry might be for you.
