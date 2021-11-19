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


const TypedRectangle = Model([
    new fields.IntegerField('width', {min: 1, max: 1000}),
    new fields.IntegerField('height', {min: 1, max: 1000}),
    new fields.BooleanField('isFilled', {default: false}),
]);

test('IntegerField casts to integer', () => {
    const r = new TypedRectangle({width: '0xff', height: '123'});
    expect(r.width).toBe(255);
    expect(r.height).toBe(123);
    r.width = 1001;
    expect(r.width).toBe(1000);
    r.width = 0;
    expect(r.width).toBe(1);
    r.height = 'too big';
    expect(r.height).toBe(123);
});

test('BooleanField casts to boolean', () => {
    const r = new TypedRectangle({isFilled: 'yes'});
    expect(r.isFilled).toBe(true);
    r.isFilled = 0;
    expect(r.isFilled).toBe(false);
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

test('objects can be serialised to JSON', () => {
    const r = new TypedRectangle({width: 320, height: 200});
    rectJSON = r.toJSON();
    rectData = JSON.parse(rectJSON);
    expect(rectData).toStrictEqual({width: 320, height: 200, isFilled: false});
});

test('objects can be deserialised from JSON', () => {
    const r = TypedRectangle.fromJSON('{"width": 320, "height": 200}');
    expect(r).toBeInstanceOf(TypedRectangle);
    expect(r.width).toBe(320);
    expect(r.height).toBe(200);
});
