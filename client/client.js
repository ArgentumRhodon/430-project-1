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

const requestVehicleInfoJSON = async (endpoint, query) => {
  const vehicleInfoResponse = await fetch(
    `/${endpoint}${query ? "?" + query : ""}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
  return await vehicleInfoResponse.json();
};

const fillSelectOptions = (selectElement, options) => {
  selectElement.innerHTML = "";

  if (options[0]) {
    for (let option of options) {
      const optionElement = document.createElement("option");
      optionElement.innerText = option.text;
      optionElement.value = option.value;
      selectElement.appendChild(optionElement);
    }
  } else {
    const optionElement = document.createElement("option");
    optionElement.innerText = options.text;
    optionElement.value = options.value;
    selectElement.appendChild(optionElement);
  }
};

// Vehicle info inputs
const vehicleYearSelect = document.getElementById("yearSelect");
const vehicleMakeSelect = document.getElementById("makeSelect");
const vehicleModelSelect = document.getElementById("modelSelect");
const vehicleOptionsSelect = document.getElementById("optionsSelect");

// Fill vehicle years
const vehicleYears = await requestVehicleInfoJSON("years");
fillSelectOptions(vehicleYearSelect, vehicleYears.menuItem);

const updateVehicleMakeSelect = async () => {
  const vehicleMakes = await requestVehicleInfoJSON(
    "make",
    `year=${vehicleYearSelect.value}`
  );
  fillSelectOptions(vehicleMakeSelect, vehicleMakes.menuItem);
};

// Add make options once vehicle year is selected
vehicleYearSelect.addEventListener("change", updateVehicleMakeSelect);

const updateVehicleModelSelect = async () => {
  const vehicleModels = await requestVehicleInfoJSON(
    "model",
    `year=${vehicleYearSelect.value}&make=${vehicleMakeSelect.value}`
  );
  fillSelectOptions(vehicleModelSelect, vehicleModels.menuItem);
};

vehicleMakeSelect.addEventListener("change", updateVehicleModelSelect);

const updateVehicleOptionsSelect = async () => {
  const vehicleOptions = await requestVehicleInfoJSON(
    "options",
    `year=${vehicleYearSelect.value}&make=${vehicleMakeSelect.value}&model=${vehicleModelSelect.value}`
  );
  fillSelectOptions(vehicleOptionsSelect, vehicleOptions.menuItem);
};

vehicleModelSelect.addEventListener("change", updateVehicleOptionsSelect);
