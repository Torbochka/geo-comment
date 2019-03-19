export default class Utils {

    static formatDate(date) {
        let m = date.getMonth().length > 1 ? date.getMonth() : `0${date.getMonth()}`;
        let d = date.getDay().length > 1 ? date.getDay() : `0${date.getDay()}`;

        return [
            `${date.getFullYear()}.${m}.${d}`,
            `${date.getHours()}:${m}:${date.getSeconds()}`
        ].join(' ');
    }

    static getCoords(el) {
        let elPosition = el.getBoundingClientRect();

        return {
            top: elPosition.top + pageYOffset,
            left: elPosition.left + pageXOffset
        };
    }
}

