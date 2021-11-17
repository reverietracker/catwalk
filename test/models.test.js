const { Model, fields } = require('../');

const Rectangle = Model([
    new fields.ValueField('width', {'default': 300}),
    new fields.ValueField('height'),
]);

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


const TypedRectangle = Model([
    new fields.IntegerField('width', {'min': 1, 'max': 1000}),
    new fields.IntegerField('height', {'min': 1, 'max': 1000}),
    new fields.BooleanField('isFilled', {'default': false}),
]);

test('IntegerField casts to integer', () => {
    const r = new TypedRectangle({'width': '0xff', 'height': '123'});
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
    const r = new TypedRectangle({'isFilled': 'yes'});
    expect(r.isFilled).toBe(true);
    r.isFilled = 0;
    expect(r.isFilled).toBe(false);
});
