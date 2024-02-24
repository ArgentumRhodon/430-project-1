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

// Vehicle info inputs
const vehicleYearSelect = document.getElementById("yearSelect");
const vehicleMakeSelect = document.getElementById("makeSelect");
const vehicleModelSelect = document.getElementById("modelSelect");
const vehicleOptionsSelect = document.getElementById("optionsSelect");

// Fill vehicle years
const vehicleYearResponse = await fetch("/years", {
  method: "GET",
  headers: {
    Accept: "application/json",
  },
});
const vehicleYears = await vehicleYearResponse.json();
for (let year of vehicleYears.menuItem) {
  const option = document.createElement("option");
  option.innerText = year.text;
  option.value = year.value;
  vehicleYearSelect.appendChild(option);
}

const updateVehicleMakeSelect = async () => {
  const vehicleMakeResponse = await fetch(
    `/make?year=${vehicleYearSelect.value}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
  const vehicleMakes = await vehicleMakeResponse.json();
  for (let make of vehicleMakes.menuItem) {
    const option = document.createElement("option");
    option.innerText = make.text;
    option.value = make.value;
    vehicleMakeSelect.appendChild(option);
  }
};

vehicleYearSelect.addEventListener("change", updateVehicleMakeSelect);
