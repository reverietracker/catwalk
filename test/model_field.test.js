const { Model, fields } = require('../');

class Artist extends Model([
    new fields.ValueField('name'),
]) {
}

class Band extends Model([
    new fields.ListField('members', new fields.ModelField('member', Artist), 4),
]) {
}

test('models can be deserialised', () => {
    const beatles = Band.fromJSON('{"members": [{"name": "John"}, {"name": "Paul"}, {"name": "Ringo"}, {"name": "George"}]}');
    expect(beatles).toBeInstanceOf(Band);
    const john = beatles.getMember(0);
    expect(john).toBeInstanceOf(Artist);
    expect(john.name).toBe("John");
});
