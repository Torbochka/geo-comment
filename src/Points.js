let instance;

class Points {

    #key = 0;
    #points = new Map();

    constructor() {
        if (instance) {
            return instance;
        }

        instance = this;
    }

    addPoint(p) {
        this.#points.set(++this.#key, p);
    }

    getPoint(k) {
        return this.#points.get(k);
    }

    getPoints() {
        return this.#points;
    }

    getKeyCounter() {
        return this.#key;
    }
}

export default Points;