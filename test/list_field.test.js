import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Model, fields } from '../index.js';

class Sequence extends Model([
    new fields.ListField(
        'elements', new fields.IntegerField('element', {default: 0, max: 100}), {length: 5}
    ),
]) {}

class DefaultSequence extends Model([
    new fields.ListField(
        'elements',
        new fields.IntegerField('element', {default: 0, max: 100}),
        {length: 5, default: [2, 3, 5, 7, 11]},
    ),
]) {}

test('list field items can be retrieved', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    assert.strictEqual(seq.getElement(2), 5);
});

test('list fields can be retrieved in full', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    assert.deepStrictEqual(seq.getElement(), [2, 3, 5, 7, 11]);
});

test('list fields get defaults from subfield', () => {
    const seq = new Sequence();
    assert.strictEqual(seq.getElement(2), 0);
});

test('list fields get defaults from list field', () => {
    const seq = new DefaultSequence();
    assert.deepStrictEqual(seq.getElement(), [2, 3, 5, 7, 11]);
});

test('list field items can be set', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    seq.setElement(2, 6);
    assert.strictEqual(seq.getElement(2), 6);
});

test('validation is applied when setting list items', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    seq.setElement(2, 999);
    assert.strictEqual(seq.getElement(2), 100);
});

test('not-long-enough lists are padded with default values', () => {
    const seq = new Sequence({'elements': [1, 2, 3]});
    assert.deepStrictEqual(seq.getElement(), [1, 2, 3, 0, 0]);
});

test('change events on lists are triggered', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    let status = 'unchanged';
    seq.on('changeElement', (index, newVal) => {
        status = 'element ' + index + ' changed to ' + newVal;
    });
    seq.setElement(2, 5);
    assert.strictEqual(status, 'unchanged');
    seq.setElement(2, 'purple');
    assert.strictEqual(status, 'unchanged');
    seq.setElement(2, 6);
    assert.strictEqual(status, 'element 2 changed to 6');
});

test('model-wide change events on lists are triggered', () => {
    const seq = new Sequence({'elements': [2, 3, 5, 7, 11]});
    let status = 'unchanged';
    seq.on('change', (fieldName, index, newVal) => {
        status = fieldName + ' ' + index + ' changed to ' + newVal;
    });
    seq.setElement(2, 5);
    assert.strictEqual(status, 'unchanged');
    seq.setElement(2, 'purple');
    assert.strictEqual(status, 'unchanged');
    seq.setElement(2, 6);
    assert.strictEqual(status, 'elements 2 changed to 6');
});

class Sprite extends Model([
    new fields.ListField(
        'bitmap',
        new fields.ListField('row', new fields.BooleanField('pixel'), {length: 8}),
        {length: 8, elementName: 'pixel'}
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

    assert.strictEqual(s.getPixel(3, 6), true);
    assert.strictEqual(status, 'unchanged');
    s.setPixel(3, 6, false);
    assert.strictEqual(s.getPixel(3, 6), false);
    assert.strictEqual(status, 'pixel (6, 3) changed to false');
});

class OneBasedSequence extends Model([
    new fields.ListField(
        'elements', new fields.IntegerField('element', {default: 0, max: 100}), {startIndex: 1, endIndex: 6}
    ),
]) {}

test('default values for non-zero-based lists use correct padding', () => {
    const seq = new OneBasedSequence();
    assert.deepStrictEqual(Array.from(seq.getElement()), [undefined, 0, 0, 0, 0, 0]);
});

test('items can be retrieved from non-zero-based lists', () => {
    const seq = new OneBasedSequence({elements: [null, 2, 3, 5, 7, 11]});
    assert.strictEqual(seq.getElement(3), 5);
});

test('non-zero-based lists can be retrieved in full', () => {
    const seqJson = '{"elements": [2, 3, 5, 7, 11]}';
    const seq = OneBasedSequence.fromJSON(seqJson);
    assert.deepStrictEqual(Array.from(seq.getElement()), [undefined, 2, 3, 5, 7, 11]);
});

test('non-zero-based lists can be serialised and deserialised', () => {
    const seqJson = '{"elements": [2, 3, 5, 7, 11]}';
    const seq = OneBasedSequence.fromJSON(seqJson);
    assert.strictEqual(seq.getElement(3), 5);
    const seqJsonOut = seq.toJSON();
    assert.deepStrictEqual(JSON.parse(seqJsonOut), JSON.parse(seqJson));
});

test('endIndex or length must be specified', () => {
    assert.throws(() => {
        class InvalidSequence extends Model([
            new fields.ListField(
                'elements', new fields.IntegerField('element', {default: 0, max: 100}), {startIndex: 1}
            ),
        ]) {}
    }, { message: 'either length or endIndex must be specified' });
});
