// Mapbox init
mapboxgl.accessToken =
  "pk.eyJ1IjoibHVjYXNjb3JleSIsImEiOiJjbG9xaWp2amowZ2VyMmxtdTJ0a2g1c2JpIn0.om_UI9UBSGsTmH9KM-8iaw";
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});

// Mapbox autofill init
const script = document.createElement("script");
script.src = "https://api.mapbox.com/search-js/v1.0.0-beta.18/web.js";
script.onload = function () {
  mapboxsearch.autofill({
    accessToken:
      "pk.eyJ1IjoibHVjYXNjb3JleSIsImEiOiJjbG9xaWp2amowZ2VyMmxtdTJ0a2g1c2JpIn0.om_UI9UBSGsTmH9KM-8iaw",
  });
};
document.head.appendChild(script);

// Vehicle info
