//const campground = require("../../models/campground")

mapboxgl.accessToken=mapToken
const map = new mapboxgl.Map({
    container:"map",
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: [23.5, 46.7] ,// starting position [lng, lat]
    zoom: 10
})

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.setPopup({offset:25})
        .setHTML(
            `<h3>${campground.name}</h3>`
        )
    
    )
    .addTo(map)


