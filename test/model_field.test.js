const { Model, fields } = require('../');

class Artist extends Model([
    new fields.ValueField('name'),
]) {
}

class Band extends Model([
    new fields.ListField('members', new fields.ModelField('member', Artist), 4),
]) {
}

test('model fields use an empty instance as default', () => {
    const beatles = new Band();
    const member = beatles.getMember(0);
    expect(member).toBeInstanceOf(Artist);
    expect(member.name).toBe(null);
});

test('models can be deserialised', () => {
    const beatlesJson = '{"members": [{"name": "John"}, {"name": "Paul"}, {"name": "Ringo"}, {"name": "George"}]}';
    const beatles = Band.fromJSON(beatlesJson);
    expect(beatles).toBeInstanceOf(Band);
    const john = beatles.getMember(0);
    expect(john).toBeInstanceOf(Artist);
    expect(john.name).toBe("John");

    const beatlesSerialized = beatles.toJSON();
    expect(JSON.parse(beatlesJson)).toEqual(JSON.parse(beatlesSerialized));
});
