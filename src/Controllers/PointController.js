import PointModel from '../Models/PointModel.js';
import PointsModel from '../Models/PointsModel.js';
import View from '../Views/View.js';
import Utils from '../Utils.js';
import feedbackForm from '../Templates/feedbackForm.hbs';
import YObjects from '../Models/YObjects.js';

let points = new PointsModel();
let yObjects = new YObjects();

export default {

    async openFormOnMap(e) {
        let res = await ymaps.geocode(e.get('coords'), { result: 1 });
        let geoObject = res.geoObjects.get(0);
        let coords = geoObject.geometry.getCoordinates();
        let address = geoObject.getAddressLine();
        let pagePxls = e.get('pagePixels');

        points.addPoint(PointModel.createPoint());
        yObjects.addYObject(points.getKeyCounter(),
            new ymaps.Placemark(coords, {
                id: points.getKeyCounter(),
                location: address,
                pixels: pagePxls
            }, {
                preset: 'islands#violetIcon',
                openBalloonOnClick: false
            }));

        View.render(feedbackForm, { location: address }, {
            tag: 'div',
            id: 'feedbackTemplate',
            display: 'block',
            left: pagePxls[0],
            top: pagePxls[1]
        });

        let b = document.getElementById('add-comment');

        b.setAttribute('data-id', points.getKeyCounter());
    },

    addCommentOnForm(e) {
        let pId = +e.target.dataset.id;
        let yPoint = yObjects.getYObject(pId);
        let yCluster = yObjects.getYObject('cluster');
        let oPoint = points.getPoint(pId);

        let location = yPoint.properties.get('location');
        let pixels = yPoint.properties.get('pixels');

        let name = document.querySelector('#name');
        let place = document.querySelector('#place');
        let comment = document.querySelector('#comment');
        let date = Utils.formatDate(new Date());

        let header = [`<b>${name.value}</b>`,
            `<a href="" id='ballonHeader' data-index-number='${pId}'>${location}</a>`
        ].join('');

        if (oPoint.isCommentsEmpty()) {
            points.getPoint(pId).addComment({
                l: location,
                n: name.value,
                p: place.value,
                c: comment.value,
                d: date
            });

            yPoint.properties.set({
                'balloonContentHeader': header,
                'balloonContentBody': comment.value,
                balloonContentFooter: date
            });

            yCluster.add(yPoint);

        } else {
            oPoint.addComment({
                l: yPoint.properties.get('location'),
                n: name.value,
                p: place.value,
                c: comment.value,
                d: date
            });

            let newPoint = new ymaps.Placemark(yPoint.geometry.getCoordinates(), {
                id: pId,
                pixels: pixels,
                location: yPoint.properties.get('location'),
                balloonContentHeader: header,
                balloonContentBody: comment.value,
                balloonContentFooter: date
            }, {
                preset: 'islands#violetIcon',
                openBalloonOnClick: false
            });

            yCluster.add(newPoint);
        }

        let pixelsObj = Utils.getCoords(document.getElementById('feedback'));
        let pxls = [pixelsObj.left, pixelsObj.top];

        View.render(feedbackForm, oPoint.getPoint(), {
            tag: 'div',
            id: 'feedbackTemplate',
            display: 'block',
            left: pxls[0],
            top: pxls[1]
        });

        let b = document.getElementById('add-comment');

        b.setAttribute('data-id', `${pId}`);
    },

    closeForm() {
        View.render(feedbackForm, {}, {
            tag: 'div',
            id: 'feedbackTemplate',
            display: 'none'
        });
    },

    openFormByClickBallon(e) {
        e.preventDefault();
        let yCluster = yObjects.getYObject('cluster');

        yCluster.balloon.close();

        let id = e.target.dataset.indexNumber;
        let oPoint = points.getPoint(+id).getPoint();
        let pixels = [e.clientX, e.clientY];

        View.render(feedbackForm, oPoint, {
            tag: 'div',
            id: 'feedbackTemplate',
            display: 'block',
            left: pixels[0],
            top: pixels[1]
        });

        let b = document.getElementById('add-comment');

        b.setAttribute('data-id', id);
    },

    clickMap(e) {
        let geoObject = e.get('target').properties.get('geoObjects') || e.get('target');
        let id;

        if (!Array.isArray(geoObject)) {
            id = geoObject.properties.get('id');
            let pagePxls = geoObject.properties.get('pixels');
            let oPoint = points.getPoint(id).getPoint();

            View.render(feedbackForm, oPoint, {
                tag: 'div',
                id: 'feedbackTemplate',
                display: 'block',
                left: pagePxls[0],
                top: pagePxls[1]
            });
        }

        let b = document.getElementById('add-comment');

        b.setAttribute('data-id', id);
    },
}