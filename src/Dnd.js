const feedback = document.getElementById('feedback');

export default {

    addListeners (target) {
        let shiftX;
        let shiftY;

        let getCoords = el => {
            let elPosition = el.getBoundingClientRect();

            return {
                top: elPosition.top + pageYOffset,
                left: elPosition.left + pageXOffset
            };
        };

        let moveAt = e => {
            let el = document.getElementById('feedback');

            el.style.left = e.pageX - shiftX + 'px';
            el.style.top = e.pageY - shiftY + 'px';
        };

        let mouseDown = e => {
            if (e.target.closest('#header')) {
                let el = document.getElementById('feedback');
                let coords = getCoords(el);

                shiftX = e.pageX - coords.left;
                shiftY = e.pageY - coords.top;

                target.addEventListener('mousemove', moveAt);
            }
        };

        let mouseUp = () => {
            target.removeEventListener('mousemove', moveAt);
        };

        target.addEventListener('mousedown', mouseDown);
        target.addEventListener('mouseup', mouseUp);
    }
}