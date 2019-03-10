import ymaps from 'ymaps';

const ymap = document.querySelector('#map');
const ysrc = 'https://api-maps.yandex.ru/2.1.73/?apikey=a5aed195-90aa-45d5-a3a6-cee5ef5ee9a9&lang=ru_RU';

// Подождать пока
let map = ymaps.load(ysrc).then(maps => {
    return new maps.Map('map', {
        center: [55.76, 37.64],
        zoom: 7
    });
}).catch(error => console.log('Failed to load Yandex Maps', error));

ymap.addEventListener('click', () => {
    map.then(m => {

        console.log(m);

        m.geoObjects.add(new ymaps.Placemark([55.684758, 37.738521], {
            balloonContent: 'цвет <strong>воды пляжа бонди</strong>'
        }, {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        }))
    });
});