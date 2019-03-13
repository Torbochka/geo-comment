const feedbackTemplate = require('../src/form-feedback.hbs');

const feedback = document.querySelector('#feedback');

ymaps.ready(() => {

    let point = {};
    let countId = 0;
    let pointsData = {};
    let map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 7
    }, {});

    let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customItemContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        clusterBalloonPagerSize: 5

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
        let address = getAddress(c);

        point = new ymaps.Placemark(c, {
            id: ++countId,
            location: address
        }, {
            preset: 'islands#violetIcon',
            balloonContentHeader: address,
            balloonContentBody: [],
            balloonContentFooter: ''
        });

        feedback.innerHTML = feedbackTemplate({ location: point.properties.get('location') });
        let pagePixels = e.get('pagePixels');

        feedback.style.left = `${pagePixels[0]}px`;
        feedback.style.top = `${pagePixels[1]}px`;
        feedback.style.display = 'block';

        point.events.add('click', e => {
            feedback.innerHTML = feedbackTemplate(pointsData[e.get('target').properties.get('id')]);
            let pagePixels = e.get('pagePixels');

            feedback.style.left = `${pagePixels[0]}px`;
            feedback.style.top = `${pagePixels[1]}px`;
            feedback.style.display = 'block';
        });
    });

    document.addEventListener('click', e => {

        // TODO разобраться с шаблоном
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

                clusterer.add(new ymaps.Placemark(point.geometry.getCoordinates(), {
                    id: ++countId,
                    location: point.properties.get('location')
                }, {
                    preset: 'islands#violetIcon',
                    balloonContentHeader: point.properties.get('location'),
                    balloonContentBody: comment.value,
                    balloonContentFooter: date
                }));

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

                point.properties.balloonContentBody = [...comment.value];
                point.properties.balloonContentFooter = date;

                map.geoObjects.remove(clusterer);
                clusterer.add(point);
                map.geoObjects.add(clusterer);
            }

            feedback.innerHTML = feedbackTemplate(pointsData[pointId]);
        }

        closeForm(e);
    });

});

