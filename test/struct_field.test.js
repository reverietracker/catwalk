const { Model, fields } = require('../');

class Sprite extends Model([
    new fields.StructField('position', [
        new fields.IntegerField('x', {default: 32, max: 256}),
        new fields.IntegerField('y', {default: 24, max: 192}),
    ]),
]) {}

class Character extends Model([
    new fields.StructField('polygon', [
        new fields.ListField('vertices', new fields.IntegerField('vertex'), {length: 4}),
        new fields.ListField('edges', new fields.IntegerField('edge'), {length: 4}),
    ]),
]) {}

test('struct field elements can be retrieved', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    expect(sprite.getPosition('y')).toBe(88);
});

test('struct fields can be retrieved in full', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    expect(sprite.getPosition()).toEqual({'x': 128, 'y': 88});
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

test('missing fields are populated with defaults', () => {
    const sprite = new Sprite({'position': {'x': 128}});
    expect(sprite.getPosition('y')).toBe(24);
});

test('change events on structs are triggered', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    let status = 'unchanged';
    sprite.on('changePosition', (index, newVal) => {
        status = 'position ' + index + ' changed to ' + newVal;
    });
    sprite.setPosition('x', 128);
    expect(status).toBe('unchanged');
    sprite.setPosition('x', 'purple');
    expect(status).toBe('unchanged');
    sprite.setPosition('x', 100);
    expect(status).toBe('position x changed to 100');
});

test('struct fields can be serialised', () => {
    const sprite = new Sprite({'position': {'x': 128, 'y': 88}});
    const spriteJson = sprite.toJSON();
    expect(JSON.parse(spriteJson)).toEqual({'position': {'x': 128, 'y': 88}});
});

test('struct fields can be deserialised', () => {
    const sprite = Sprite.fromJSON('{"position": {"x": 128, "thing": 99}}');
    expect(sprite.getPosition('x')).toBe(128);
    expect(sprite.getPosition('y')).toBe(24);
});


test('subfields within struct fields can be retrieved recursively', () => {
    const char = new Character({'polygon': {
        'vertices': [1, 2, 3, 4],
        'edges': [5, 6, 7, 8],
    }});
    expect(char.getPolygon('edges', 1)).toBe(6);
});

test('subfields within struct fields can be set recursively', () => {
    const char = new Character({'polygon': {
        'vertices': [1, 2, 3, 4],
        'edges': [5, 6, 7, 8],
    }});
    char.setPolygon('edges', 1, 99)
    expect(char.getPolygon('edges', 1)).toBe(99);
});
