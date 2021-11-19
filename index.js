const EventEmitter = require('events');
const fields = require('./lib/fields');


class BaseModel extends EventEmitter {
    constructor(data) {
        if (!data) data = {};
        super();
        this.constructor._meta.fieldList.forEach((field) => {
            field.init(this, data);
        });
    }

    toData() {
        const data = {};
        this.constructor._meta.fieldList.forEach((field) => {
            field.serialize(this, data);
        });
        return data;
    }

    toJSON() {
        return JSON.stringify(this.toData());
    }

    static fromData(data) {
        const constructorArgs = {};
        this._meta.fieldList.forEach((field) => {
            if (field.name in data) {
                constructorArgs[field.name] = field.deserialize(data[field.name]);
            }
        });
        return new this(constructorArgs);
    }

    static fromJSON(str) {
        return this.fromData(JSON.parse(str));
    }
}


function Model(fields) {
    let cls = class extends BaseModel {};
    cls._meta = {
        fieldList: fields,
        fields: {},
    }

    fields.forEach((field) => {
        cls._meta.fields[field.name] = field;
        field.contributeToClass(cls);
    });

    return cls;
}


module.exports = { fields, Model };
