const { Model, fields } = require('../');

class Sequence extends Model([
    new fields.ListField('elements', new fields.IntegerField('element', {default: 0, max: 100}), 5),
]) {}

test('list field items can be retrieved', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    expect(seq.getElement(2)).toBe(5);
});

test('list fields can be retrieved in full', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    expect(seq.getElement()).toEqual([2, 3, 5, 7, 11]);
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
    seq.setElement(2, 'purple');
    expect(status).toBe('unchanged');
    seq.setElement(2, 6);
    expect(status).toBe('element 2 changed to 6');
});

class Sprite extends Model([
    new fields.ListField(
        'bitmap',
        new fields.ListField('row', new fields.BooleanField('pixel'), 8),
        8,
        {elementName: 'pixel'}
    ),
]) {}

test('elements in nested ListFields can be accessed', () => {
    const s = new Sprite({
        'bitmap': [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
        ]
    });

    let status = 'unchanged';
    s.on('changePixel', (y, x, newVal) => {
        status = `pixel (${x}, ${y}) changed to ${newVal}`;
    });

    expect(s.getPixel(3, 6)).toBe(true);
    expect(status).toBe('unchanged');
    s.setPixel(3, 6, false);
    expect(s.getPixel(3, 6)).toBe(false);
    expect(status).toBe('pixel (6, 3) changed to false');
});
