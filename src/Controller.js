import Point from '../src/PointModel.js';
import Points from '../src/Points.js';
import View from '../src/View.js';
import Utils from '../src/Utils.js';
import feedbackForm from '../src/feedbackForm.hbs';
import YPoints from './YPoints';

export default {

    async openFormOnMap(e) {
        let res = await ymaps.geocode(e.get('coords'), { result: 1 });
        let geoObject = res.geoObjects.get(0);
        let coords = geoObject.geometry.getCoordinates();
        let address = geoObject.getAddressLine();

        let points = new Points();

        points.addPoint(Point.createPoint());

        let yPoints = new YPoints();

        yPoints.addYPoint(new ymaps.Placemark(coords, {
            id: points.getKeyCounter(),
            location: address,
            pixels: e.get('pagePixels')
        }, {
            preset: 'islands#violetIcon',
            openBalloonOnClick: false
        }));

        let container = document.createElement('div');
        let pagePxls = e.get('pagePixels');

        container.innerHTML = View.render(feedbackForm, { location: address });
        container.id = 'feedbackTemplate';
        document.body.appendChild(container);
        let form = document.getElementById(container.id).firstElementChild;
        let b = document.getElementById('add-comment');

        b.setAttribute('data-id', points.getKeyCounter());

        form.style.left = `${pagePxls[0]}px`;
        form.style.top = `${pagePxls[1]}px`;
        form.style.display = 'block';
    },

    addCommentOnForm(e, map, oCluster) {

        let pId = +e.target.dataset.id;
        let yPoints = new YPoints();
        let point = yPoints.getYPoint(+pId);
        let location = point.properties.get('location');
        let pixels = point.properties.get('pixels');
        let points = new Points();
        let oPoint = points.getPoint(pId);
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
            point.properties.set({
                'balloonContentHeader': header,
                'balloonContentBody': comment.value,
                balloonContentFooter: date
            });
            oCluster.add(point);

        } else {
            oPoint.addComment({
                l: point.properties.get('location'),
                n: name.value,
                p: place.value,
                c: comment.value,
                d: date
            });

            let newPoint = new ymaps.Placemark(point.geometry.getCoordinates(), {
                id: pId,
                location: point.properties.get('location'),
                balloonContentHeader: header,
                balloonContentBody: comment.value,
                balloonContentFooter: date
            }, {
                preset: 'islands#violetIcon',
                openBalloonOnClick: false
            });

            oCluster.add(newPoint);
        }

        let container = document.createElement('div');

        container.innerHTML = View.render(feedbackForm, oPoint.getPoint());
        container.id = 'feedbackTemplate';
        document.getElementById(container.id).remove();
        document.body.appendChild(container);
        let form = document.getElementById(container.id).firstElementChild;
        let addButton = document.getElementById('add-comment');

        addButton.setAttribute('data-id', points.getKeyCounter());

        form.style.left = `${pixels[0]}px`;
        form.style.top = `${pixels[1]}px`;
        form.style.display = 'block';
    }
}