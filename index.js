const EventEmitter = require('events');
const fields = require('./lib/fields');


class BaseModel extends EventEmitter {
    constructor(data) {
        if (!data) data = {};
        super();
        this.constructor.fieldList.forEach((field) => {
            field.init(this, data);
        });
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


module.exports = { fields, Model };
