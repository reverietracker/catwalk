const EventEmitter = require('events');

class BaseModel extends EventEmitter {
    constructor(data) {
        if (!data) data = {};
        super();
        this.constructor.fieldList.forEach((field) => {
            if (field.name in data) {
                field.set(this, field.clean(data[field.name]));
            } else {
                field.set(this, field.getDefault());
            }
        });
    }

    toData() {
        const data = {};
        this.constructor.fieldList.forEach((field) => {
            data[field.name] = field.serialize(field.get(this));
        });
        return data;
    }

    toJSON() {
        return JSON.stringify(this.toData());
    }

    static fromData(data) {
        const constructorArgs = {};
        this.fieldList.forEach((field) => {
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
    cls.fieldList = fields;
    cls.fields = {};

    fields.forEach((field) => {
        cls.fields[field.name] = field;
        field.contributeToClass(cls);
    });

    return cls;
}


module.exports = { Model };
