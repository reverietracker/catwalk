import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Model, fields } from '../index.js';

class Rectangle extends Model([
    new fields.ValueField('width', {default: 300}),
    new fields.ValueField('height'),
]) {
    getArea() {
        return this.width * this.height;
    }
}

test('model fields can be read', () => {
    const r = new Rectangle({width: 320, height: 200});
    assert.strictEqual(r.width, 320);
});

test('model fields can be written', () => {
    const r = new Rectangle({width: 320, height: 200});
    r.width = 240;
    assert.strictEqual(r.width, 240);
});

test('model fields can have defaults', () => {
    const r = new Rectangle();
    assert.strictEqual(r.width, 300);
    assert.strictEqual(r.height, null);
});

test('models can have methods', () => {
    const r = new Rectangle({width: 320, height: 200});
    assert.strictEqual(r.getArea(), 64000);
});

test('model fields have labels', () => {
    assert.deepStrictEqual(Rectangle.fields.width.label, 'Width');
});


const TypedRectangle = Model([
    new fields.IntegerField('width', {min: 1, max: 1000}),
    new fields.NumberField('height', {min: 1, max: 1000}),
    new fields.BooleanField('isFilled', {default: false}),
    new fields.EnumField('color', {
        choices: [
            ['ff0000', 'red'],
            ['00ff00', 'green'],
            ['0000ff', 'blue'],
        ],
        default: 'ff0000'
    }),
]);

test('IntegerField casts to integer', () => {
    const r = new TypedRectangle({width: '0xff', height: '123'});
    assert.strictEqual(r.width, 255);
    r.width = 1001;
    assert.strictEqual(r.width, 1000);
    r.width = 0;
    assert.strictEqual(r.width, 1);
    r.width = 50.75;
    assert.strictEqual(r.width, 50);
    r.width = 'too big';
    assert.strictEqual(r.width, 50);
});

test('NumberField casts to float', () => {
    const r = new TypedRectangle({width: '0xff', height: '123'});
    assert.strictEqual(r.height, 123);
    r.height = 1001;
    assert.strictEqual(r.height, 1000);
    r.height = 0;
    assert.strictEqual(r.height, 1);
    r.height = 50.75;
    assert.strictEqual(r.height, 50.75);
    r.height = 'too big';
    assert.strictEqual(r.height, 50.75);
});

test('BooleanField casts to boolean', () => {
    const r = new TypedRectangle({isFilled: 'yes'});
    assert.strictEqual(r.isFilled, true);
    r.isFilled = 0;
    assert.strictEqual(r.isFilled, false);
});

test('EnumField validates values', () => {
    const r = new TypedRectangle({color: '00ff00'});
    assert.strictEqual(r.color, '00ff00');
    r.color = 'purple';
    assert.strictEqual(r.color, '00ff00');
});

class Wave extends Model([
    new fields.EnumField('waveType', {choices: [
        [1, "Square"],
        [2, "Triangle"],
        [3, "Sine"],
    ], default: 1}),
]) {}

test('EnumField casts to integer', () => {
    const w = new Wave();
    w.waveType = '2';
    assert.strictEqual(w.waveType, 2);
});

test('change events on fields are triggered', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    let status = 'unchanged';
    r.on('changeWidth', (newWidth) => {
        status = 'width changed to ' + newWidth;
    });
    r.height = 240;
    assert.strictEqual(status, 'unchanged');
    r.width = 320;
    assert.strictEqual(status, 'unchanged');
    r.width = 1001;
    assert.strictEqual(status, 'width changed to 1000');

    status = 'unchanged'
    r.width = 1000;
    assert.strictEqual(status, 'unchanged');
});

test('model-wide change events on fields are triggered', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    let status = 'unchanged';
    r.on('change', (fieldName, newWidth) => {
        status = fieldName + ' changed to ' + newWidth;
    });
    r.width = 320;
    assert.strictEqual(status, 'unchanged');
    r.width = 1001;
    assert.strictEqual(status, 'width changed to 1000');
    r.height = 240;
    assert.strictEqual(status, 'height changed to 240');

    status = 'unchanged'
    r.width = 1000;
    assert.strictEqual(status, 'unchanged');
});

test('objects can be serialised to JSON', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    const rectJSON = r.toJSON();
    const rectData = JSON.parse(rectJSON);
    assert.deepStrictEqual(rectData, {width: 320, height: 200, isFilled: false, color: 'ff0000'});
});

test('objects can be deserialised from JSON', () => {
    const r = TypedRectangle.fromJSON('{"width": 320, "height": 200}');
    assert.ok(r instanceof TypedRectangle);
    assert.strictEqual(r.width, 320);
    assert.strictEqual(r.height, 200);
});
