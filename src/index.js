import Controller from './Controllers/PointController.js';
import YObjects from './Models/YObjects.js';
import DnD from './Dnd.js';
import '../src/style.css';
import '@fortawesome/fontawesome-free/js/all';

const yObjects = new YObjects();

ymaps.ready(() => {
    const fullscreenControl = new ymaps.control.FullscreenControl();

    let map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,
        controls: [fullscreenControl]
    }, {
        fullscreenZIndex: 900
    });

    fullscreenControl.enterFullscreen();

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
        clusterBalloonItemContentLayout: ymaps.templateLayoutFactory.createClass (
            '<h2 class=ballon-header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon-body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon-footer>{{ properties.balloonContentFooter|raw }}</div>'
        ),
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        clusterBalloonPagerSize: 5
    });

    map.geoObjects.add(oCluster);
    yObjects.addYObject('map', map)
        .addYObject('cluster', oCluster);

    DnD.addListeners(window);

    map.events.add('click', e => {
        Controller.openFormOnMap(e);
    });

    map.geoObjects.events.add('click', e => {
        Controller.clickMap(e);
    });

    document.addEventListener('click', e => {
        if (e.target.id === 'add-comment') {
            Controller.addCommentOnForm(e);

            return;
        }

        if (e.target.closest('#close')) {
            Controller.closeForm();

            return;
        }

        if (e.target.id === 'ballonHeader') {
            Controller.openFormByClickBallon(e);
        }
    });
});
