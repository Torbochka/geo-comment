let instance;

class YPoints {

    #yPoints = new Map();

    constructor() {
        if (instance) {
            return instance;
        }

        instance = this;
    }

    addYPoint(p) {
        this.#yPoints.set(p.properties.get('id'), p);
    }

    getYPoint(k) {
        return this.#yPoints.get(k);
    }

    getYPoints() {
        return this.#yPoints;
    }
}

export default YPoints;