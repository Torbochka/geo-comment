let instance;

class PointsModel {

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

    getKeyCounter() {
        return this.#key;
    }
}

export default PointsModel;