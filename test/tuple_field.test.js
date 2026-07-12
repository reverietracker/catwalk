import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Model, fields } from '../index.js';

class Sprite extends Model([
    new fields.TupleField('position', [
        new fields.IntegerField('x', {default: 32, max: 256}),
        new fields.IntegerField('y', {default: 24, max: 192}),
    ]),
]) {}

test('tuple field elements can be retrieved', () => {
    const sprite = new Sprite({'position': [128,88]});
    assert.strictEqual(sprite.getPosition(1), 88);
});

test('tuple defaults are picked up from subfields', () => {
    const sprite = new Sprite();
    assert.strictEqual(sprite.getPosition(0), 32);
});

test('tuple field elements can be set', () => {
    const sprite = new Sprite({'position': [128,88]});
    sprite.setPosition(0, 100);
    assert.strictEqual(sprite.getPosition(0), 100);
});

test('validation is applied when setting tuple items', () => {
    const sprite = new Sprite({'position': [128,88]});
    sprite.setPosition(1, 999);
    assert.strictEqual(sprite.getPosition(1), 192);
});

test('change events on tuples are triggered', () => {
    const sprite = new Sprite({'position': [128,88]});
    let status = 'unchanged';
    sprite.on('changePosition', (index, newVal) => {
        status = 'position ' + index + ' changed to ' + newVal;
    });
    sprite.setPosition(0, 128);
    assert.strictEqual(status, 'unchanged');
    sprite.setPosition(0, 100);
    assert.strictEqual(status, 'position 0 changed to 100');
});

test('model-wide change events on tuples are triggered', () => {
    const sprite = new Sprite({'position': [128,88]});
    let status = 'unchanged';
    sprite.on('change', (fieldName, index, newVal) => {
        status = fieldName + ' ' + index + ' changed to ' + newVal;
    });
    sprite.setPosition(0, 128);
    assert.strictEqual(status, 'unchanged');
    sprite.setPosition(0, 100);
    assert.strictEqual(status, 'position 0 changed to 100');
});

test('tuple fields can be serialised', () => {
    const sprite = new Sprite({'position': [128,88]});
    const spriteJson = sprite.toJSON();
    assert.deepStrictEqual(JSON.parse(spriteJson), {'position': [128,88]});
});

test('tuple fields can be deserialised', () => {
    const sprite = Sprite.fromJSON('{"position": [128,88]}');
    assert.strictEqual(sprite.getPosition(0), 128);
});
