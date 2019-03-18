import Point from '../src/PointModel.js';
import Points from '../src/Points.js';
import Controller from '../src/Controller.js';
import YMaps from '../src/Utils.js';

import '../src/style.css';
import '@fortawesome/fontawesome-free/js/all';

const feedbackTempl = require('./feedbackForm.hbs');
const feedback = document.querySelector('#feedback');
let name;
let place;
let comment;
let date;

let points = new Points();

ymaps.ready(() => {

    let map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,
    }, {});

    map.controls.remove('zoomControl');
    map.controls.remove('searchControl');
    map.controls.remove('trafficControl');
    map.controls.remove('typeSelector');

    let customContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class=ballon-header>{{ properties.balloonContentHeader|raw }}</h2>' +
    '<div class=ballon-body>{{ properties.balloonContentBody|raw }}</div>' +
    '<div class=ballon-footer>{{ properties.balloonContentFooter|raw }}</div>'
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

    map.events.add('click', e => {
        Controller.openFormOnMap(e);
    });

    map.geoObjects.events.add('click', e => {
        let pagePxls = e.get('pagePixels');
        let geoObject = e.get('target').properties.get('geoObjects') || e.get('target');

        if (!Array.isArray(geoObject)) {
            let oPoint = points.getPoint(geoObject.properties.get('id'));
            let fbTempl = feedbackTempl(oPoint.getPoint());

            displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);
        }
    });

    document.addEventListener('click', e => {
    // TODO разобраться с шаблоном
        name = document.querySelector('#name');
        place = document.querySelector('#place');
        comment = document.querySelector('#comment');
        date = formatDate(new Date());

        if (e.target.id === 'add-comment') {
            Controller.addCommentOnForm(e, map, oCluster);

            return;
        }

        if (e.target.closest('#close')) {
            displayCommentForm();

            return;
        }

        if (e.target.id === 'ballonHeader') {
            e.preventDefault();
            oCluster.balloon.close();
            let pagePxls = [e.clientX, e.clientY];
            let fbTempl = feedbackTempl(points.getPoint(+e.target.dataset.indexNumber).getPoint());

            displayCommentForm(`${pagePxls[0]}px`, `${pagePxls[1]}px`, 'block', fbTempl);
        }
    });
});
