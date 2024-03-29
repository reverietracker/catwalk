const { Model, fields } = require('../');

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
    expect(r.width).toBe(320);
});

test('model fields can be written', () => {
    const r = new Rectangle({width: 320, height: 200});
    r.width = 240;
    expect(r.width).toBe(240);
});

test('model fields can have defaults', () => {
    const r = new Rectangle();
    expect(r.width).toBe(300);
    expect(r.height).toBe(null);
});

test('models can have methods', () => {
    const r = new Rectangle({width: 320, height: 200});
    expect(r.getArea()).toBe(64000);
});

test('model fields have labels', () => {
    expect(Rectangle.fields.width.label).toEqual('Width');
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
    expect(r.width).toBe(255);
    r.width = 1001;
    expect(r.width).toBe(1000);
    r.width = 0;
    expect(r.width).toBe(1);
    r.width = 50.75;
    expect(r.width).toBe(50);
    r.width = 'too big';
    expect(r.width).toBe(50);
});

test('NumberField casts to float', () => {
    const r = new TypedRectangle({width: '0xff', height: '123'});
    expect(r.height).toBe(123);
    r.height = 1001;
    expect(r.height).toBe(1000);
    r.height = 0;
    expect(r.height).toBe(1);
    r.height = 50.75;
    expect(r.height).toBe(50.75);
    r.height = 'too big';
    expect(r.height).toBe(50.75);
});

test('BooleanField casts to boolean', () => {
    const r = new TypedRectangle({isFilled: 'yes'});
    expect(r.isFilled).toBe(true);
    r.isFilled = 0;
    expect(r.isFilled).toBe(false);
});

test('EnumField validates values', () => {
    const r = new TypedRectangle({color: '00ff00'});
    expect(r.color).toBe('00ff00');
    r.color = 'purple';
    expect(r.color).toBe('00ff00');
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
    expect(w.waveType).toBe(2);
});

test('change events on fields are triggered', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    let status = 'unchanged';
    r.on('changeWidth', (newWidth) => {
        status = 'width changed to ' + newWidth;
    });
    r.height = 240;
    expect(status).toBe('unchanged');
    r.width = 320;
    expect(status).toBe('unchanged');
    r.width = 1001;
    expect(status).toBe('width changed to 1000');

    status = 'unchanged'
    r.width = 1000;
    expect(status).toBe('unchanged');
});

test('model-wide change events on fields are triggered', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    let status = 'unchanged';
    r.on('change', (fieldName, newWidth) => {
        status = fieldName + ' changed to ' + newWidth;
    });
    r.width = 320;
    expect(status).toBe('unchanged');
    r.width = 1001;
    expect(status).toBe('width changed to 1000');
    r.height = 240;
    expect(status).toBe('height changed to 240');

    status = 'unchanged'
    r.width = 1000;
    expect(status).toBe('unchanged');
});

test('objects can be serialised to JSON', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    rectJSON = r.toJSON();
    rectData = JSON.parse(rectJSON);
    expect(rectData).toStrictEqual({width: 320, height: 200, isFilled: false, color: 'ff0000'});
});

test('objects can be deserialised from JSON', () => {
    const r = TypedRectangle.fromJSON('{"width": 320, "height": 200}');
    expect(r).toBeInstanceOf(TypedRectangle);
    expect(r.width).toBe(320);
    expect(r.height).toBe(200);
});
