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

// Returns vehicle information retrieved from node server
// Client --> Node server --> fueleconomy.gov api
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

// A given option is valid if it doesn't start with "Select", which is the common
// string element of the select inputs' default options
const isValidOption = (option) => !option.startsWith("Select");

// Retrieve inputs
const yearSelect = document.getElementById("yearSelect");
const makeSelect = document.getElementById("makeSelect");
const modelSelect = document.getElementById("modelSelect");
const optionsSelect = document.getElementById("optionsSelect");
const confirmVehicleBtn = document.getElementById("confirmVehicle");

// Store inputs in array to allow for index-based selection adjustments in event listeners
const vehicleInputs = [yearSelect, makeSelect, modelSelect, optionsSelect];

const defaults = ["Year", "Make", "Model", "Options"];

const fillSelectOptions = (selectElement, options) => {
  // FuelEco api sends different data structure if matching data count is one, which is annoying
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

const updateVehicleYearSelect = async () => {
  const vehicleYears = await requestVehicleInfoJSON("years");
  fillSelectOptions(yearSelect, vehicleYears.menuItem);
  yearSelect.disabled = false;
};

const updateVehicleMakeSelect = async () => {
  const vehicleMakes = await requestVehicleInfoJSON(
    "make",
    `year=${yearSelect.value}`
  );
  fillSelectOptions(makeSelect, vehicleMakes.menuItem);
  makeSelect.disabled = false;
};

const updateVehicleModelSelect = async () => {
  const vehicleModels = await requestVehicleInfoJSON(
    "model",
    `year=${yearSelect.value}&make=${makeSelect.value}`
  );
  fillSelectOptions(modelSelect, vehicleModels.menuItem);
  modelSelect.disabled = false;
};

const updateVehicleOptionsSelect = async () => {
  const vehicleOptions = await requestVehicleInfoJSON(
    "options",
    `year=${yearSelect.value}&make=${makeSelect.value}&model=${modelSelect.value}`
  );
  fillSelectOptions(optionsSelect, vehicleOptions.menuItem);
  optionsSelect.disabled = false;
};

yearSelect.addEventListener("change", updateVehicleMakeSelect);
makeSelect.addEventListener("change", updateVehicleModelSelect);
modelSelect.addEventListener("change", updateVehicleOptionsSelect);
optionsSelect.addEventListener("change", (e) => {
  if (isValidOption(e.target.value)) {
    confirmVehicleBtn.disabled = false;
  } else {
    confirmVehicleBtn.disabled = true;
  }
});

const init = async () => {
  // Disable all inputs
  for (let input of vehicleInputs) input.disabled = true;
  confirmVehicleBtn.disabled = true;

  // All inputs except vehicleOptionsSelect: on updating an input, reset descending inputs
  for (let i = 0; i < vehicleInputs.length - 1; i++) {
    vehicleInputs[i].addEventListener("change", () => {
      // If the user changes to "Select [X]" option, reset next immediate input as well
      const closestIndexAfter = isValidOption(vehicleInputs[i].value)
        ? i + 1
        : i;

      for (let j = vehicleInputs.length - 1; j > closestIndexAfter; j--) {
        vehicleInputs[j].disabled = true;
        vehicleInputs[
          j
        ].innerHTML = `<option selected>Select ${defaults[j]}</option>`;
      }

      confirmVehicleBtn.disabled = true;
    });
  }

  // Get the form started with available years
  updateVehicleYearSelect();
};

init();
