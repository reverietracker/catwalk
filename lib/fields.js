const { camelCaseToLabel, smushName } = require('./string');


class BaseField {
    constructor(name, options) {
        this.options = options || {};
        this.name = name;
        this.label = this.options.label || camelCaseToLabel(name);
    }

    contributeToClass(cls) {}
    clean(val) { return val; }
    serialize(val) { return val; }
    deserialize(val) { return val; }
}


class ValidationError extends Error {}


class ValueField extends BaseField {
    constructor(name, options) {
        super(name, options);
        this.internalName = this.options.internalName || ('_' + name);
        this.eventName = this.options.eventName || smushName('change', name);
        this.default = ('default' in this.options) ? this.clean(this.options.default) : null;
    }

    contributeToClass(cls) {
        Object.defineProperty(cls.prototype, this.name, this.descriptor);
    }

    getDefault() {
        return this.default;
    }

    set(instance, val) {
        instance[this.internalName] = val;
    }

    get(instance) {
        return instance[this.internalName];
    }

    getElement(obj, keys) {
        /* istanbul ignore next */
        throw new Error("Cannot get an element of a ValueField")
    }

    setElement(obj, keys, val) {
        /* istanbul ignore next */
        throw new Error("Cannot set an element of a ValueField")
    }

    get descriptor() {
        let field = this;
        return {
            enumerable: true,
            get() {
                return this[field.internalName];
            },
            set(newVal) {
                let cleanVal;
                try {
                    cleanVal = field.clean(newVal);
                } catch (e) {
                    /* istanbul ignore else */
                    if (e instanceof ValidationError) {
                        return;
                    } else {
                        throw e;
                    }
                }
                if (this[field.internalName] !== cleanVal) {
                    this[field.internalName] = cleanVal;
                    this.emit(field.eventName, cleanVal);
                    this.emit("change", field.name, cleanVal)
                }
            },
        };
    }
}


class IntegerField extends ValueField {
    constructor(name, options) {
        super(name, options);
        this.min = ('min' in this.options) ? this.options.min : null;
        this.max = ('max' in this.options) ? this.options.max : null;
    }
    clean(val) {
        let cleanVal = parseInt(val);
        if (isNaN(cleanVal)) throw new ValidationError();
        if (this.min !== null && cleanVal < this.min) cleanVal = this.min;
        if (this.max !== null && cleanVal > this.max) cleanVal = this.max;
        return cleanVal;
    }
}


class BooleanField extends ValueField {
    clean(val) {return !!val;}
}


class ModelField extends ValueField {
    constructor(name, model, options) {
        super(name, options);
        this.model = model;
    }

    getDefault() {
        return new this.model();
    }

    serialize(val) {
        return val.toData();
    }

    deserialize(val) {
        return this.model.fromData(val);
    }
}


class ListField extends BaseField {
    constructor(name, subfield, options) {
        super(name, options);

        this.subfield = subfield;

        this.startIndex = this.options.startIndex || 0;
        if ('endIndex' in this.options) {
            this.endIndex = this.options.endIndex;
            this.length = this.endIndex - this.startIndex;
        } else if ('length' in this.options) {
            this.length = this.options.length;
            this.endIndex = this.startIndex + this.length;
        } else {
            throw new Error("either length or endIndex must be specified")
        }

        this.elementName = this.options.elementName || this.subfield.name;
        this.getterName = this.options.getterName || smushName('get', this.elementName);
        this.setterName = this.options.setterName || smushName('set', this.elementName);
        this.eventName = this.options.eventName || smushName('change', this.elementName);
    }

    contributeToClass(cls) {
        let field = this;

        cls.prototype[this.getterName] = function(...keys) {
            if (keys.length) {
                /* return a list item */
                return field.getElement(this[field.name], keys);
            } else {
                /* return the list */
                return this[field.name];
            }
        };

        cls.prototype[this.setterName] = function(...args) {
            let val = args.pop();
            if (field.setElement(this[field.name], args, val)) {
                this.emit(field.eventName, ...args, val);
                this.emit("change", field.name, ...args, val);
            }
        };
    }

    getDefault() {
        if ('default' in this.options) {
            return this.clean(this.options.default);
        } else {
            const arr = new Array(this.length);
            for (let i = 0; i < this.length; i++) {
                arr[i] = this.subfield.getDefault();
            }
            return arr;
        }
    }

    set(instance, val) {
        instance[this.name] = val;
    }

    get(instance) {
        return instance[this.name];
    }

    clean(arr) {
        const cleanArr = new Array(this.endIndex)
        if (arr.length < this.endIndex) {
            for (let i = this.startIndex; i < arr.length; i++) {
                cleanArr[i] = this.subfield.clean(arr[i]);
            }
            for (let i = arr.length; i < this.endIndex; i++) {
                cleanArr[i] = this.subfield.getDefault();
            }
        } else {
            for (let i = this.startIndex; i < this.endIndex; i++) {
                cleanArr[i] = this.subfield.clean(arr[i]);
            }
        }
        return cleanArr;
    }

    getElement(obj, keys) {
        let key, rest;
        [key, ...rest] = keys;
        let val = obj[key];
        if (rest.length) {
            return this.subfield.getElement(val, rest);
        } else {
            return val;
        }
    }

    setElement(obj, keys, val) {
        let key, rest;
        [key, ...rest] = keys;
        if (rest.length) {
            return this.subfield.setElement(obj[key], rest, val);
        } else {
            let cleanVal;
            try {
                cleanVal = this.subfield.clean(val);
            } catch (e) {
                /* istanbul ignore else */
                if (e instanceof ValidationError) {
                    return false;
                } else {
                    throw e;
                }
            }

            if (obj[key] === cleanVal) {
                return false;
            } else {
                obj[key] = cleanVal;
                return true;
            }
        }
    }

    serialize(val) {
        let itemData = new Array(this.length);
        for (let i = this.startIndex; i < val.length; i++) {
            itemData[i - this.startIndex] = this.subfield.serialize(val[i]);
        }
        return itemData;
    }

    deserialize(val) {
        let items = new Array(this.endIndex);
        for (let i = 0; i < val.length; i++) {
            items[i + this.startIndex] = this.subfield.deserialize(val[i]);
        }
        return items;
    }
}

class BaseStructField extends BaseField {
    /* common superclass of StructField (name-indexed) and TupleField (number-indexed) */
    constructor(name, fields, options) {
        super(name, options);

        this.fieldList = fields;
        this.getterName = this.options.getterName || smushName('get', name);
        this.setterName = this.options.setterName || smushName('set', name);
        this.eventName = this.options.eventName || smushName('change', name);
    }

    set(instance, val) {
        instance[this.name] = val;
    }

    get(instance) {
        return instance[this.name];
    }

    getElement(obj, keys) {
        let key, rest;
        [key, ...rest] = keys;
        let val = obj[key];
        if (rest.length) {
            return this.fieldLookup[key].getElement(val, rest);
        } else {
            return val;
        }
    }

    setElement(obj, keys, val) {
        let key, rest;
        [key, ...rest] = keys;
        let field = this.fieldLookup[key];
        if (rest.length) {
            return field.setElement(obj[key], rest, val);
        } else {
            let cleanVal;
            try {
                cleanVal = this.fieldLookup[key].clean(val);
            } catch (e) {
                /* istanbul ignore else */
                if (e instanceof ValidationError) {
                    return false;
                } else {
                    throw e;
                }
            }

            if (obj[key] === cleanVal) {
                return false;
            } else {
                obj[key] = cleanVal;
                return true;
            }
        }
    }

    contributeToClass(cls) {
        let field = this;

        cls.prototype[this.getterName] = function(...keys) {
            if (keys.length) {
                /* return a single element */
                return field.getElement(this[field.name], keys);
            } else {
                /* return the complete structure */
                return this[field.name];
            }
        };

        cls.prototype[this.setterName] = function(...args) {
            let val = args.pop();
            if (field.setElement(this[field.name], args, val)) {
                this.emit(field.eventName, ...args, val);
                this.emit("change", field.name, ...args, val);
            }
        };
    }
}

class TupleField extends BaseStructField {
    constructor(name, fields, options) {
        super(name, fields, options);
        this.fieldLookup = fields;
    }

    getDefault() {
        return this.fieldList.map(field => field.getDefault());
    }

    clean(arr) {
        return this.fieldList.map((field, i) => field.clean(arr[i]));
    }

    serialize(arr) {
        return this.fieldList.map((field, i) => field.serialize(arr[i]));
    }

    deserialize(arr) {
        return this.fieldList.map((field, i) => field.deserialize(arr[i]));
    }
}

class StructField extends BaseStructField {
    constructor(name, fields, options) {
        super(name, fields, options);

        this.fieldLookup = {};
        fields.forEach(field => {
            this.fieldLookup[field.name] = field;
        });
    }

    getDefault() {
        const result = {};
        this.fieldList.forEach(field => {
            result[field.name] = field.getDefault();
        });
        return result;
    }

    clean(obj) {
        const result = {};
        this.fieldList.forEach(field => {
            if (field.name in obj) {
                result[field.name] = field.clean(obj[field.name]);
            } else {
                result[field.name] = field.getDefault();
            }
        });
        return result;
    }

    serialize(obj) {
        const result = {};
        this.fieldList.forEach(field => {
            result[field.name] = field.serialize(obj[field.name]);
        });
        return result;
    }

    deserialize(obj) {
        const result = {};
        for (let key in obj) {
            const field = this.fieldLookup[key];
            if (field) result[field.name] = field.deserialize(obj[key]);
        }
        return result;
    }
}


module.exports = { BaseField, ValueField, IntegerField, BooleanField, ModelField, ListField, TupleField, StructField };
