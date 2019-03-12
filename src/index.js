const feedbackTemplate = require('../src/form-feedback.hbs');

const feedback = document.querySelector('#feedback');

ymaps.ready(() => {

    let point = {};
    let countId = 0;
    let pointsData = {};
    let map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 7
    });

    let getAddress = (coords) => {
        return ymaps.geocode(coords).then((r) => r.geoObjects.get(0).getAddressLine());
    };

    let closeForm = (e) => {
        if (e.target.id === 'close') {
            feedback.innerHTML = feedbackTemplate();
            feedback.style.left = '0';
            feedback.style.top = '0';
            feedback.style.display = 'none';
        }
    };

    let formatedDate = (date) => {

        let m = date.getMonth().length > 1 ? date.getMonth() : `0${date.getMonth()}`;
        let d = date.getDay().length > 1 ? date.getDay() : `0${date.getDay()}`;

        return [
            `${date.getFullYear()}.${m}.${d}`,
            `${date.getHours()}:${m}:${date.getSeconds()}`
        ].join(' ');
    };

    map.events.add('click', e => {
        let c = e.get('coords');

        point = new ymaps.Placemark(c, {
            id: ++countId,
            location: getAddress(c)
        });

        feedbackTemplate({ location: getAddress(c) });

        let pagePixels = e.get('pagePixels');

        feedback.style.left = `${pagePixels[0]}px`;
        feedback.style.top = `${pagePixels[1]}px`;
        feedback.style.display = 'block';
    });

    document.addEventListener('click', e => {

        // TODO разобраться с шаблоном
        const feedback = document.querySelector('#feedback');
        const name = document.querySelector('#name');
        const place = document.querySelector('#place');
        const comment = document.querySelector('#comment');

        if (e.target.id === 'add-comment') {
            let pointId = point.properties.get('id');
            let date = formatedDate(new Date());

            if (pointsData.hasOwnProperty(pointId)) {
                pointsData[pointId].comments.push({
                    name: name.value,
                    place: place.value,
                    comment: comment.value,
                    date: date
                });
            } else {
                pointsData[pointId] = {
                    location: point.properties.get('location'),
                    comments: [{
                        name: name.value,
                        place: place.value,
                        comment: comment.value,
                        date: date
                    }]
                };
                map.geoObjects.add(point);
            }

            feedback.innerHTML = feedbackTemplate(pointsData[pointId]);
        }

        closeForm(e);
    });

});

