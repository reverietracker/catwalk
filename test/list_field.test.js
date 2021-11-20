const { Model, fields } = require('../');

class Sequence extends Model([
    new fields.ListField('elements', new fields.IntegerField('element', {default: 0, max: 100}), 5),
]) {}

test('list field items can be retrieved', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    expect(seq.getElement(2)).toBe(5);
});

test('list fields get defaults from subfield', () => {
    const seq = new Sequence();
    expect(seq.getElement(2)).toBe(0);
});

test('list field items can be set', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    seq.setElement(2, 6);
    expect(seq.getElement(2)).toBe(6);
});

test('validation is applied when setting list items', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    seq.setElement(2, 999);
    expect(seq.getElement(2)).toBe(100);
});

test('change events on lists are triggered', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    let status = 'unchanged';
    seq.on('changeElement', (index, newVal) => {
        status = 'element ' + index + ' changed to ' + newVal;
    });
    seq.setElement(2, 5);
    expect(status).toBe('unchanged');
    seq.setElement(2, 6);
    expect(status).toBe('element 2 changed to 6');
});
