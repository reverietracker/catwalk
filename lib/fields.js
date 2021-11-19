const { smushName } = require('./string');


class BaseField {
    constructor(name, opts) {
        this.opts = opts || {};
        this.name = name;
    }

    contributeToClass(cls) {}
    init(instance, data) {}
}


class ValidationError extends Error {}


class ValueField extends BaseField {
    constructor(name, opts) {
        super(name, opts);
        this.internalName = this.opts.internalName || ('_' + name);
        this.eventName = this.opts.eventName || smushName('change', name);
        this.default = ('default' in this.opts) ? this.opts.default : null;
    }

    contributeToClass(cls) {
        Object.defineProperty(cls.prototype, this.name, this.descriptor);
    }

    init(instance, data) {
        let val = this.default;
        if (this.name in data) {
            try {
                val = this.clean(data[this.name]);
            } catch (e) {
                if (!(e instanceof ValidationError)) throw e;
            }
        }
        instance[this.internalName] = val;
    }

    clean(val) {
        return val;
    }

    serialize(instance, data) {
        data[this.name] = instance[this.internalName];
    }

    deserialize(val) {
        return val;
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


module.exports = { BaseField, ValueField, IntegerField, BooleanField };
