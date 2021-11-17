class BaseField {
    constructor(name, opts) {
        this.opts = opts || {};
        this.name = name;
    }

    contributeToClass(cls) {}
    init(instance, data) {}
}


class ValueField extends BaseField {
    constructor(name, opts) {
        super(name, opts);
        this.internalName = this.opts.internalName || ('_' + name);
        this.default = ('default' in this.opts) ? this.opts.default : null;
    }

    contributeToClass(cls) {
        Object.defineProperty(cls.prototype, this.name, this.descriptor);
    }

    init(instance, data) {
        instance[this.internalName] = (this.name in data) ? data[this.name] : this.default;
    }

    get descriptor() {
        let field = this;
        return {
            enumerable: true,
            get() {
                return this[field.internalName];
            },
            set(newVal) {
                this[field.internalName] = newVal;
            }
        };
    }
}


module.exports = { BaseField, ValueField };
