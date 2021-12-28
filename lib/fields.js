const { smushName } = require('./string');


class BaseField {
    constructor(name, opts) {
        this.opts = opts || {};
        this.name = name;
    }

    contributeToClass(cls) {}
    init(instance, data) {}
    getDefault() { return null; }
    clean(val) { return val; }
    serialize(instance, data) {}
    deserialize(val) { return val; }
}


class ValidationError extends Error {}


class ValueField extends BaseField {
    constructor(name, opts) {
        super(name, opts);
        this.internalName = this.opts.internalName || ('_' + name);
        this.eventName = this.opts.eventName || smushName('change', name);
        this.default = ('default' in this.opts) ? this.clean(this.opts.default) : null;
    }

    contributeToClass(cls) {
        Object.defineProperty(cls.prototype, this.name, this.descriptor);
    }

    init(instance, data) {
        let isInitialized = false;
        if (this.name in data) {
            try {
                instance[this.internalName] = this.clean(data[this.name]);
                isInitialized = true;
            } catch (e) {
                if (!(e instanceof ValidationError)) throw e;
            }
        }
        if (!isInitialized) {
            instance[this.internalName] = this.getDefault();
        }
    }

    getDefault() {
        return this.default;
    }

    serialize(instance, data) {
        data[this.name] = instance[this.internalName];
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
                    if (e instanceof ValidationError) {
                        return;
                    } else {
                        throw e;
                    }
                }
                if (this[field.internalName] !== cleanVal) {
                    this[field.internalName] = cleanVal;
                    this.emit(field.eventName, cleanVal);
                }
            },
        };
    }
}


class IntegerField extends ValueField {
    constructor(name, opts) {
        super(name, opts);
        this.min = ('min' in this.opts) ? this.opts.min : null;
        this.max = ('max' in this.opts) ? this.opts.max : null;
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


class ListField extends BaseField {
    constructor(name, subfield, length, opts) {
        super(name, opts);

        this.subfield = subfield;
        this.length = length;
        this.elementName = this.opts.elementName || this.subfield.name;
        this.getterName = this.opts.getterName || smushName('get', this.elementName);
        this.setterName = this.opts.setterName || smushName('set', this.elementName);
        this.eventName = this.opts.eventName || smushName('change', this.elementName);
    }

    contributeToClass(cls) {
        let field = this;

        cls.prototype[this.getterName] = function(...keys) {
            if (keys.length) {
                /* return a list item */
                return field.get(this[field.name], keys);
            } else {
                /* return the list */
                return this[field.name];
            }
        };

        cls.prototype[this.setterName] = function(...args) {
            let val = args.pop();
            if (field.set(this[field.name], args, val)) {
                this.emit(field.eventName, ...args, val);
            }
        };
    }

    getDefault() {
        const arr = new Array(this.length);
        for (let i = 0; i < this.length; i++) {
            arr[i] = this.subfield.getDefault();
        }
        return arr;
    }

    clean(arr) {
        return arr.map(val => this.subfield.clean(val));
    }

    init(instance, data) {
        if (this.name in data) {
            const sourceArray = data[this.name];
            const arr = new Array(this.length);
            for (let i = 0; i < this.length; i++) {
                try {
                    arr[i] = this.subfield.clean(sourceArray[i]);
                } catch (e) {
                    if (e instanceof ValidationError) {
                        arr[i] = this.subfield.getDefault();
                    } else {
                        throw e;
                    }
                }
            }
            instance[this.name] = arr;
        } else {
            instance[this.name] = this.getDefault();
        }
    }

    get(obj, keys) {
        let key, rest;
        [key, ...rest] = keys;
        let val = obj[key];
        if (rest.length) {
            return this.subfield.get(val, rest);
        } else {
            return val;
        }
    }

    set(obj, keys, val) {
        let key, rest;
        [key, ...rest] = keys;
        if (rest.length) {
            return this.subfield.set(obj[key], rest, val);
        } else {
            let cleanVal;
            try {
                cleanVal = this.subfield.clean(val);
            } catch (e) {
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
}

class TupleField extends BaseField {
    constructor(name, subfields, opts) {
        super(name, opts);

        this.subfields = subfields;
        this.getterName = this.opts.getterName || smushName('get', name);
        this.setterName = this.opts.setterName || smushName('set', name);
        this.eventName = this.opts.eventName || smushName('change', name);
    }

    contributeToClass(cls) {
        let field = this;

        cls.prototype[this.getterName] = function(...keys) {
            if (keys.length) {
                /* return a single element */
                return field.get(this[field.name], keys);
            } else {
                /* return the complete structure */
                return this[field.name];
            }
        };

        cls.prototype[this.setterName] = function(...args) {
            let val = args.pop();
            if (field.set(this[field.name], args, val)) {
                this.emit(field.eventName, ...args, val);
            }
        };
    }

    getDefault() {
        return this.subfields.map((field) => {
            return field.getDefault();
        });
    }

    clean(arr) {
        return arr.map(val, i => this.subfields[i].clean(val));
    }

    get(obj, keys) {
        let key, rest;
        [key, ...rest] = keys;
        let val = obj[key];
        if (rest.length) {
            return this.subfields[key].get(val, rest);
        } else {
            return val;
        }
    }

    set(obj, keys, val) {
        let key, rest;
        [key, ...rest] = keys;
        let field = this.subfields[key];
        if (rest.length) {
            return field.set(obj[key], rest, val);
        } else {
            let cleanVal;
            try {
                cleanVal = this.subfields[key].clean(val);
            } catch (e) {
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

    init(instance, data) {
        if (this.name in data) {
            const sourceArray = data[this.name];
            instance[this.name] = this.subfields.map((field, i) => {
                try {
                    return field.clean(sourceArray[i]);
                } catch (e) {
                    if (e instanceof ValidationError) {
                        return field.getDefault();
                    } else {
                        throw e;
                    }
                }
            });
        } else {
            instance[this.name] = this.getDefault();
        }
    }
}


module.exports = { BaseField, ValueField, IntegerField, BooleanField, ListField, TupleField };
