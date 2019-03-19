let instance;

class YObjects {

    #yObjects = new Map();

    constructor() {
        if (instance) {
            return instance;
        }

        instance = this;
    }

    addYObject(k, p) {
        this.#yObjects.set(k, p);

        return this;
    }

    getYObject(k) {
        return this.#yObjects.get(k);
    }
}

export default YObjects;