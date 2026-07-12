import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Model, fields } from '../index.js';

class Artist extends Model([
    new fields.ValueField('name'),
]) {
}

class Band extends Model([
    new fields.ListField('members', new fields.ModelField('member', Artist), {length: 4}),
]) {
}

test('model fields use an empty instance as default', () => {
    const beatles = new Band();
    const member = beatles.getMember(0);
    assert.ok(member instanceof Artist);
    assert.strictEqual(member.name, null);
});

test('models can be deserialised', () => {
    const beatlesJson = '{"members": [{"name": "John"}, {"name": "Paul"}, {"name": "Ringo"}, {"name": "George"}]}';
    const beatles = Band.fromJSON(beatlesJson);
    assert.ok(beatles instanceof Band);
    const john = beatles.getMember(0);
    assert.ok(john instanceof Artist);
    assert.strictEqual(john.name, "John");

    const beatlesSerialized = beatles.toJSON();
    assert.deepStrictEqual(JSON.parse(beatlesJson), JSON.parse(beatlesSerialized));
});
