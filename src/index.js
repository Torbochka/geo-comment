import '../src/style.css';
import '@fortawesome/fontawesome-free/js/all';

const feedbackTempl = require('../src/form-feedback.hbs');
const feedback = document.querySelector('#feedback');
let name;
let place;
let comment;
let date;

ymaps.ready(() => {
    let point = {};
    let incId = 0;
    let oPoints = {};
    let customContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class=ballon-header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=ballon-body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon-footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    let map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,
    }, {});

    map.controls.remove('zoomControl');
    map.controls.remove('searchControl');
    map.controls.remove('trafficControl');
    map.controls.remove('typeSelector');

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

    map.geoObjects.add(oCluster);

    let displayCommentForm = (l = '0', t = '0', d = 'none', oPoint) => {
        feedback.innerHTML = oPoint;
        feedback.style.left = l;
        feedback.style.top = t;
        feedback.style.display = d;
    };

    let formatDate = date => {
        let m = date.getMonth().length > 1 ? date.getMonth() : `0${date.getMonth()}`;
        let d = date.getDay().length > 1 ? date.getDay() : `0${date.getDay()}`;

        return [
            `${date.getFullYear()}.${m}.${d}`,
            `${date.getHours()}:${m}:${date.getSeconds()}`
        ].join(' ');
    };

    let addCommentOnForm = () => {
        let pId = point.properties.get('id');
        let location = point.properties.get('location');
        let header = [`<b>${name.value}</b>`,
            `<a href="" id='ballonHeader' data-index-number='${pId}'>${location}</a>`
        ].join('');

        if (oPoints.hasOwnProperty(pId)) {
            oPoints[pId].comments.push({
                name: name.value,
                place: place.value,
                comment: comment.value,
                date: date
            });

            let newPoint = new ymaps.Placemark(point.geometry.getCoordinates(), {
                id: ++incId,
                parentId: pId,
                location: point.properties.get('location'),
                balloonContentHeader: header,
                balloonContentBody: comment.value,
                balloonContentFooter: date
            }, {
                preset: 'islands#violetIcon',
            });

            oCluster.add(newPoint);

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

            point.properties.set({
                'balloonContentHeader': header,
                'balloonContentBody': comment.value,
                balloonContentFooter: date
            });
            oCluster.add(point);
        }

        feedback.innerHTML = feedbackTempl(oPoints[pId]);
    };
    
    map.events.add('click', e => {
        ymaps.geocode(e.get('coords'), { result: 1 })
            .then(res => {
                let geoObject = res.geoObjects.get(0);
                let coords = geoObject.geometry.getCoordinates();
                let address = geoObject.getAddressLine();

                point = new ymaps.Placemark(coords, {
                    id: ++incId,
                    location: address,
                }, {
                    preset: 'islands#violetIcon',
                    openBalloonOnClick: false
                });

                let fbTempl = feedbackTempl({ location: address });
                let pagePxls = e.get('pagePixels');

                displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);

                point.events.add('click', e => {
                    let fbTempl = feedbackTempl(oPoints[e.get('target').properties.get('id')]);
                    let pagePxls = e.get('pagePixels');

                    displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);
                });
            });
    });

    document.addEventListener('click', e => {
        // TODO разобраться с шаблоном
        name = document.querySelector('#name');
        place = document.querySelector('#place');
        comment = document.querySelector('#comment');
        date = formatDate(new Date());

        if (e.target.id === 'add-comment') {
            addCommentOnForm();
            
            return;
        }

        if (e.target.closest('#close')) {
            displayCommentForm();

            return;
        }

        if (e.target.id === 'ballonHeader') {
            e.preventDefault();
            map.balloon.close();
            let pagePxls = [e.clientX, e.clientY];
            let fbTempl = feedbackTempl(oPoints[e.target.dataset.indexNumber]);

            displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);
        }
    });
});
