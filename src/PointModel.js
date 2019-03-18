export default class Point {

    #point = {
        location: '',
        comments: []
    };

    static createPoint() {
        return new Point();
    }

    addComment({ l, n, p, c, d }) {
        this.#point.location = l;
        this.#point.comments.push({
            name: n,
            place: p,
            comment: c,
            date: d
        });

        return this;
    }

    getPoint() {
        return Object.assign({}, this.#point);
    }

    isCommentsEmpty() {
        return this.#point.comments > 0;
    }
}