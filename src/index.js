const feedbackTempl = require('../src/form-feedback.hbs');
const feedback = document.querySelector('#feedback');
let name;
let place;
let comment;

ymaps.ready(() => {
    let point = {};
    let incId = 0;
    let oPoints = {};
    let map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 7
    }, {});

    let customContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    let oCluster = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        clusterBalloonPagerSize: 5

    });

    let getAddr = coords => {
        return ymaps.geocode(coords).then((r) => r.geoObjects.get(0).getAddressLine());
    };

    let addCommentOnForm = () => {
        let pId = point.properties.get('id');
        let date = formatDate(new Date());

        if (oPoints.hasOwnProperty(pId)) {
            oPoints[pId].comments.push({
                name: name.value,
                place: place.value,
                comment: comment.value,
                date: date
            });

            oCluster.add(new ymaps.Placemark(point.geometry.getCoordinates(), {
                id: ++incId,
                location: point.properties.get('location')
            }, {
                preset: 'islands#violetIcon',
                balloonContentHeader: point.properties.get('location'),
                balloonContentBody: comment.value,
                balloonContentFooter: date
            }));

        } else {
            oPoints[pId] = {
                location: point.properties.get('location'),
                comments: [{
                    name: name.value,
                    place: place.value,
                    comment: comment.value,
                    date: date
                }]
            };

            point.properties.set('balloonContentBody', [...comment.value]);
            point.properties.set('balloonContentFooter', date);

            map.geoObjects.remove(oCluster);
            oCluster.add(point);
            map.geoObjects.add(oCluster);
        }

        feedback.innerHTML = feedbackTempl(oPoints[pId]);
    };

    let displayCommentForm = (l = '0', t = '0', d = 'none', oPoint) => {
        feedback.innerHTML = feedbackTempl();
        feedback.style.left = l;
        feedback.style.top = t;
        feedback.style.display = d;
    };

    let formatDate = (date) => {
        let m = date.getMonth().length > 1 ? date.getMonth() : `0${date.getMonth()}`;
        let d = date.getDay().length > 1 ? date.getDay() : `0${date.getDay()}`;

        return [
            `${date.getFullYear()}.${m}.${d}`,
            `${date.getHours()}:${m}:${date.getSeconds()}`
        ].join(' ');
    };
    
    map.events.add('click', e => {
        let coords = e.get('coords');
        let addr = getAddr(coords);

        point = new ymaps.Placemark(coords, {
            id: ++incId,
            location: addr
        }, {
            preset: 'islands#violetIcon',
            balloonContentHeader: addr
        });
        
        let fbTempl = feedbackTempl({ location: point.properties.get('location') });
        let pagePxls = e.get('pagePixels');

        displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);

        point.events.add('click', e => {
            let fbTempl = feedbackTempl(oPoints[e.get('target').properties.get('id')]);
            let pagePxls = e.get('pagePixels');

            displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);
        });
    });

    document.addEventListener('click', e => {
        // TODO разобраться с шаблоном
        name = document.querySelector('#name');
        place = document.querySelector('#place');
        comment = document.querySelector('#comment');

        if (e.target.id === 'add-comment') {
            addCommentOnForm(e);
        }

        if (e.target.id === 'close') {
            displayCommentForm();
        }
    });

});

