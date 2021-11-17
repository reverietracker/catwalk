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
