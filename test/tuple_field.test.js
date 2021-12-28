const { Model, fields } = require('../');

class Sprite extends Model([
    new fields.TupleField('position', [
        new fields.IntegerField('x', {default: 32, max: 256}),
        new fields.IntegerField('y', {default: 24, max: 192}),
    ]),
]) {}

test('tuple field elements can be retrieved', () => {
    const sprite = new Sprite({'position': [128,88]});
    expect(sprite.getPosition(1)).toBe(88);
});

test('tuple defaults are picked up from subfields', () => {
    const sprite = new Sprite();
    expect(sprite.getPosition(0)).toBe(32);
});

test('tuple field elements can be set', () => {
    const sprite = new Sprite({'position': [128,88]});
    sprite.setPosition(0, 100);
    expect(sprite.getPosition(0)).toBe(100);
});

test('validation is applied when setting tuple items', () => {
    const sprite = new Sprite({'position': [128,88]});
    sprite.setPosition(1, 999);
    expect(sprite.getPosition(1)).toBe(192);
});

test('change events on tuples are triggered', () => {
    const sprite = new Sprite({'position': [128,88]});
    let status = 'unchanged';
    sprite.on('changePosition', (index, newVal) => {
        status = 'position ' + index + ' changed to ' + newVal;
    });
    sprite.setPosition(0, 128);
    expect(status).toBe('unchanged');
    sprite.setPosition(0, 100);
    expect(status).toBe('position 0 changed to 100');
});
