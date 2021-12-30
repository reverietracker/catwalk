const { Model, fields } = require('../');

class Sprite extends Model([
    new fields.StructField('position', [
        new fields.IntegerField('x', {default: 32, max: 256}),
        new fields.IntegerField('y', {default: 24, max: 192}),
    ]),
]) {}

test('struct field elements can be retrieved', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    expect(sprite.getPosition('y')).toBe(88);
});

test('struct defaults are picked up from subfields', () => {
    const sprite = new Sprite();
    expect(sprite.getPosition('x')).toBe(32);
});

test('struct field elements can be set', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    sprite.setPosition('x', 100);
    expect(sprite.getPosition('x')).toBe(100);
});

test('validation is applied when setting struct items', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    sprite.setPosition('y', 999);
    expect(sprite.getPosition('y')).toBe(192);
});

test('change events on structs are triggered', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    let status = 'unchanged';
    sprite.on('changePosition', (index, newVal) => {
        status = 'position ' + index + ' changed to ' + newVal;
    });
    sprite.setPosition('x', 128);
    expect(status).toBe('unchanged');
    sprite.setPosition('x', 100);
    expect(status).toBe('position x changed to 100');
});
