// Mapbox init
mapboxgl.accessToken =
  "pk.eyJ1IjoibHVjYXNjb3JleSIsImEiOiJjbG9xaWp2amowZ2VyMmxtdTJ0a2g1c2JpIn0.om_UI9UBSGsTmH9KM-8iaw";
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

let autofillCollection;

// Mapbox autofill init
const script = document.createElement("script");
script.src = "https://api.mapbox.com/search-js/v1.0.0-beta.18/web.js";
script.onload = function () {
  autofillCollection = mapboxsearch.autofill({
    accessToken:
      "pk.eyJ1IjoibHVjYXNjb3JleSIsImEiOiJjbG9xaWp2amowZ2VyMmxtdTJ0a2g1c2JpIn0.om_UI9UBSGsTmH9KM-8iaw",
  });

  autofillCollection.addEventListener("retrieve", (e) => {
    const extraDetails = e.detail.features[0].properties.description;
    // Jank, but adds extra details to input on autofill
    // Limitation: Adding anything but a street address fails
    e.target.addEventListener(
      "change",
      () => {
        console.log(locations);
        e.target.value += `, ${extraDetails}`;
        locations[e.target.id].coords =
          e.detail.features[0].geometry.coordinates;
        locations[e.target.id].name = e.target.value;

        if (locations.start.coords && locations.end.coords) {
          getRoute(locations.start, locations.end);
          const center0 =
            (locations.start.coords[0] + locations.end.coords[0]) / 2;
          const center1 =
            (locations.start.coords[1] + locations.end.coords[1]) / 2;
          map.flyTo({
            center: [center0, center1],
            essential: true, // this animation is considered essential with respect to prefers-reduced-motion
          });
        }
      },
      { once: true }
    );
  });
};
document.head.appendChild(script);

// The vehicle used in the trip
let vehicle = {};
let locations = { start: {}, end: {} };
let trip = {};

const startInput = document.getElementById("start");
const endInput = document.getElementById("end");

startInput.value = "";
endInput.value = "";

// Returns vehicle information retrieved from node server
// Client --> Node server --> fueleconomy.gov api
const requestVehicleInfoJSON = async (type, query) => {
  const vehicleInfoResponse = await fetch(
    `/vehicleInfo/${type}${query ? "?" + query : ""}`,
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
  const vehicleYears = await requestVehicleInfoJSON("year");
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

const confirmVehicle = (e) => {
  if (isValidOption(e.target.value)) {
    Array.from(document.querySelectorAll(".form-floating")).forEach((form) =>
      form.classList.add("was-validated")
    );

    vehicle = {
      year: yearSelect.value,
      make: makeSelect.value,
      model: modelSelect.value,
      options: optionsSelect.value,
    };
    console.log(vehicle);
  }
};

yearSelect.addEventListener("change", updateVehicleMakeSelect);
makeSelect.addEventListener("change", updateVehicleModelSelect);
modelSelect.addEventListener("change", updateVehicleOptionsSelect);
optionsSelect.addEventListener("change", confirmVehicle);

const init = async () => {
  // Disable all inputs
  for (let input of vehicleInputs) input.disabled = true;

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
    });
  }

  // Get the form started with available years
  updateVehicleYearSelect();
};

const getRoute = async (start, end) => {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${locations.start.coords[0]},${locations.start.coords[1]};${locations.end.coords[0]},${locations.end.coords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );

  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };

  trip.distance = `${(data.distance * 3.28) / 5280} miles`;
  trip.duration =
    data.duration > 3600
      ? `${data.duration / 60 / 60} hours`
      : `${data.duration / 60} minutes`;

  // if the route already exists on the map, reset it using setData
  if (map.getSource("route")) {
    map.getSource("route").setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: geojson,
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3887be",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    });
  }
};

document.getElementById("saveTrip").addEventListener("click", async () => {
  trip.vehicle = vehicle;
  trip.locations = locations;

  const respone = await fetch("/addTrip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(trip),
  });
});

document.getElementById("getTrips").addEventListener("click", async () => {
  const trips = await fetch("/trips");
  const object = await trips.json();

  document.getElementById("tripContent").innerHTML = "";

  for (let trip of Object.keys(object)) {
    const data = object[trip];

    document.getElementById("tripContent").innerHTML += `
    <div class="bg-dark-subtle p-3 hstack gap-3 justify-content-around">
      <div class="text-center">
        <p class="badge text-bg-primary m-0">
          ${data.locations.start.name}
        </p>
        <p class="m-0 text-info">
          <i class="fa-solid fa-arrow-down"></i>
        </p>
        <p class="badge text-bg-primary">
          ${data.locations.end.name}
        </p>
      </div>
      <hr class="vr" />
      <div>
        <p>
          ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}:
          <span class="badge text-bg-primary">?? mpg</span>
        </p>
      </div>
      <hr class="vr" />
      <p>
        Travel:
        <span class="badge text-bg-primary">${data.duration}</span>
        <span class="badge text-bg-secondary">${data.distance}</span>
      </p>
      <hr class="vr" />
      <p>
        Gas:
        <span class="badge text-bg-primary">$?.??</span>
        <span class="badge text-bg-secondary">?.? Gal</span>
      </p>
    </div>`;
  }
});

init();
