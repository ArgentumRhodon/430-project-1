const locations = {};

// Sets up the logic for autofilling addresses
mapboxgl.accessToken = 'pk.eyJ1IjoibHVjYXNjb3JleSIsImEiOiJjbG9xaWp2amowZ2VyMmxtdTJ0a2g1c2JpIn0.om_UI9UBSGsTmH9KM-8iaw';

const confirmRouteBtn = document.getElementById('confirmRoute');

// Initialize the autofill for address fields
const initAutofill = () => {
  const script = document.createElement('script');
  script.src = 'https://api.mapbox.com/search-js/v1.0.0-beta.18/web.js';
  script.onload = function () {
    const autofillCollection = mapboxsearch.autofill({
      accessToken:
        'pk.eyJ1IjoibHVjYXNjb3JleSIsImEiOiJjbG9xaWp2amowZ2VyMmxtdTJ0a2g1c2JpIn0.om_UI9UBSGsTmH9KM-8iaw',
    });

    autofillCollection.addEventListener('retrieve', (e) => {
      const locationDetails = e.detail.features[0];
      // Takes 711 Kimball Drive to 711 Kimbal Drive to 711 Kimball Drive, Rochester, NY 14623
      const completeAddress = locationDetails.properties.full_address;
      // Mapbox's autofill is built for multi-input address forms, so this fills out
      // the whole address after Mapbox only inserts the street address.
      e.target.addEventListener('change', () => {
        e.target.value = completeAddress;
        locations[e.target.id] = {};
        // Save coordinates of selected route
        locations[e.target.id].coords = locationDetails.geometry.coordinates;
        locations[e.target.id].name = completeAddress;

        if (locations.address1.coords && locations.address2.coords) {
          confirmRouteBtn.disabled = false;
        } else {
          confirmRouteBtn.disabled = true;
        }
      });
    });
  };
  document.head.appendChild(script);
};

// Vehicle Stuff
// Uses the FuelEconomy api to get increasingly specific options as part of a vehicle selection menu
const getVehicleData = async (type, query) => {
  const dataResponse = await fetch(`${type}${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  return dataResponse.json();
};

// Vehicle selection inputs
const yearSelect = document.getElementById('yearSelect');
const makeSelect = document.getElementById('makeSelect');
const modelSelect = document.getElementById('modelSelect');
const optionsSelect = document.getElementById('optionsSelect');
const confirmVehicleBtn = document.getElementById('confirmVehicle');

// Order here is important
const selectors = [yearSelect, makeSelect, modelSelect, optionsSelect];
const defaults = ['Year', 'Make', 'Model', 'Options'];

// Fills a given select element with given options
const fillSelect = (selectElement, options) => {
  selectElement.innerHTML = `<option selected>Select ${
    defaults[selectors.indexOf(selectElement)]
  }</option>`;
  // FuelEconomy api sends a different data structure if matching data count is one
  if (options[0]) {
    for (const option of options) {
      selectElement.innerHTML += `<option value="${option.value}">${option.text}</option>`;
    }
  } else {
    selectElement.innerHTML += `<option value="${options.value}">${options.text}</option>`;
  }
};

// A simple method that checks if a selection isn't the default option
const isValidVehicleOption = (option) => !option.startsWith('Select');

// Initializes the logic used by each vehicle selection input
const initVehicleSelection = async () => {
  confirmVehicleBtn.disabled = true;

  // Disable all inputs
  for (const selector of selectors) selector.disabled = true;

  // If a given selector is selected, account for change in other subsequent selectors
  for (let i = 0; i < selectors.length - 1; i++) {
    selectors[i].addEventListener('change', (e) => {
      // If the given selector is invalid, also disable immediately subsequent selectors
      if (!isValidVehicleOption(e.target.value)) {
        confirmVehicleBtn.disabled = true;

        selectors[i + 1].disabled = true;
        selectors[i + 1].innerHTML = `<option selected>Select ${
          defaults[i + 1]
        }</option>`;
      }

      // Disable all non-immediately subsequent selectors
      for (let j = selectors.length - 1; j > i + 1; j--) {
        selectors[j].disabled = true;
        selectors[
          j
        ].innerHTML = `<option selected>Select ${defaults[j]}</option>`;
      }
    });
  }

  // Initialize the years input field
  const years = await getVehicleData('year');
  fillSelect(yearSelect, years.menuItem);
  yearSelect.disabled = false;

  // Update functions for inputs, they use getVehicleData to fill based on previous selection value
  const updateMakes = async () => {
    const makes = await getVehicleData('make', `year=${yearSelect.value}`);
    fillSelect(makeSelect, makes.menuItem);
    makeSelect.disabled = false;
  };
  const updateModels = async () => {
    const models = await getVehicleData(
      'model',
      `year=${yearSelect.value}&make=${makeSelect.value}`,
    );
    fillSelect(modelSelect, models.menuItem);
    modelSelect.disabled = false;
  };
  const updateOptions = async () => {
    const options = await getVehicleData(
      'options',
      `year=${yearSelect.value}&make=${makeSelect.value}&model=${modelSelect.value}`,
    );
    fillSelect(optionsSelect, options.menuItem);
    optionsSelect.disabled = false;
  };

  // Add event listeners
  yearSelect.addEventListener('change', (e) => {
    if (isValidVehicleOption(e.target.value)) {
      updateMakes();
    }
  });
  makeSelect.addEventListener('change', (e) => {
    if (isValidVehicleOption(e.target.value)) {
      updateModels();
    }
  });
  modelSelect.addEventListener('change', (e) => {
    if (isValidVehicleOption(e.target.value)) {
      updateOptions();
    }
  });
  optionsSelect.addEventListener('change', (e) => {
    if (isValidVehicleOption(e.target.value)) {
      confirmVehicleBtn.disabled = false;
    } else {
      confirmVehicleBtn.disabled = true;
    }
  });
};

// Sends the current vehicle to the server
const confirmVehicle = async (e) => {
  e.preventDefault();

  e.target.classList.add('was-validated');

  const vehicleJSON = {
    year: yearSelect.value,
    make: makeSelect.value,
    model: modelSelect.value,
    options: optionsSelect.value,
  };

  const response = await fetch('/vehicle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(vehicleJSON),
  });
};

// Route stuff
const startInput = document.getElementById('address1');
const endInput = document.getElementById('address2');

// Sends the current route to the server, confirmation button is diabled by default
const confirmRoute = async (e) => {
  e.preventDefault();

  // Visual form feedback
  e.target.classList.add('was-validated');

  // If both locations are validly selected from the auto-fill, query Mapbox for a route and send to the server
  // Only issue with this method is that perfect entry of a valid address does not work. You need to select from
  // Mapbox
  if (locations.address1.coords && locations.address2.coords) {
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${locations.address1.coords[0]},${locations.address1.coords[1]};${locations.address2.coords[0]},${locations.address2.coords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' },
    );
    const json = await query.json();

    // Send route to the server
    const response = await fetch('/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(json.routes[0]),
    });
  }
};

// Trip stuff
const calculateTripButton = document.getElementById('calculateTrip');

// Converts a given number of seconds to "XX min" or "XX hr XX min"
const secondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let timeString = '';

  if (hours > 0) {
    timeString += `${hours} hr `;
  }

  timeString += `${minutes} min`;

  return timeString;
};

// Uses existsing information on the server to calculate the trip for currently selected information
const calculateTrip = async () => {
  const vehicleResponse = await fetch('/vehicle', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const routeResponse = await fetch('/route', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const fuelPricesResponse = await fetch('/fuel', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const vehicle = await vehicleResponse.json();
  const route = await routeResponse.json();
  const fuelPrices = await fuelPricesResponse.json();

  const vehicleProfileResponse = await fetch(
    `/vehicleProfile?id=${vehicle.options}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  );
  const vehicleProfile = await vehicleProfileResponse.json();

  // Math stuff :D
  const totalMiles = (route.distance * 3.28) / 5280;
  const totalTime = secondsToTime(route.duration);
  const costPerGallon = fuelPrices[vehicleProfile.fuelType.toLowerCase()];
  const totalCost = (totalMiles / vehicleProfile.comb08) * costPerGallon;
  const vehicleImgURL = `https://www.fueleconomy.gov/feg/photos/${vehicleProfile.thumbnail}`;

  // Update the DOM with the currently selected trip
  setTrip(vehicle, locations, totalTime, totalMiles, totalCost, vehicleImgURL);
};

const tripsSection = document.getElementById('trips');
// Updates the DOM with a given trip
const setTrip = (vehicle, locations, time, miles, cost, vehicleImgURL) => {
  const html = `
    <div class="card col p-0" style="width: 18rem">
    <img
      src="${vehicleImgURL}"
      alt="vehicle"
      class="card-img-top"
    />
    <div class="card-body">
      <h4 class="card-title">${vehicle.year} ${vehicle.make} ${vehicle.model}</h4>
      <p class="fs-4">
        Gas: <span class="badge text-bg-primary">$${cost}</span>
      </p>
    </div>
  </div>
  <div class="card col p-0" style="width: 18rem">
    <div class="card-body">
      <h4 class="card-title">Route</h4>
      <hr />
      <div
        class="text-center my-auto h-75 vstack justify-content-between"
      >
        <p class="fs-4 m-0">
          ${locations.address1.name}
        </p>
        <i class="fa-solid fa-arrow-down fs-4 text-info"></i>
        <p class="fs-4">
          ${locations.address2.name}
        </p>
      </div>
    </div>
  </div>
  <div class="card col p-0">
    <div class="card-body">
      <h4 class="card-title">Info</h4>
      <hr />
      <p class="fs-4">
        Time: <span class="badge text-bg-primary">${time}</span>
      </p>
      <p class="fs-4">
        Distance:
        <span class="badge text-bg-primary">${miles} mi.</span>
      </p>
    </div>
  </div>
  `;

  // Create a save button with a working event
  const saveButton = document.createElement('button');
  saveButton.innerText = 'Save Trip';
  saveButton.addEventListener('click', async () => {
    const response = await fetch('/trip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        vehicle,
        locations,
        time,
        miles,
        cost,
        vehicleImgURL,
      }),
    });
  });
  saveButton.classList.add('btn', 'btn-info');

  // Update DOM
  tripsSection.innerHTML = html;
  tripsSection.appendChild(saveButton);
};

const getTripBtn = document.getElementById('getTrip');

// Gets the currently saved trip from the server and populates the page with it
const getTrip = async () => {
  const tripResponse = await fetch('/trip', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const trip = await tripResponse.json();
  setTrip(
    trip.vehicle,
    trip.locations,
    trip.time,
    trip.miles,
    trip.cost,
    trip.vehicleImgURL,
  );
};

// Call all initialization logic functions
const init = () => {
  startInput.value = '';
  endInput.value = '';

  initAutofill();
  initVehicleSelection();

  confirmRouteBtn.disabled = true;
  const vehicleForm = document.getElementById('vehicleForm');
  const routeForm = document.getElementById('routeForm');

  // Add event listeners for forms and bottom two buttons
  vehicleForm.addEventListener('submit', confirmVehicle);
  routeForm.addEventListener('submit', confirmRoute);
  calculateTripButton.addEventListener('click', calculateTrip);
  getTripBtn.addEventListener('click', getTrip);
};

init();
