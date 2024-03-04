const _ = require('lodash');
const queryS = require('querystring');
const { respondJSON, respondJSONMeta } = require('./jsonResponse');

const URL = 'https://www.fueleconomy.gov/ws/rest/vehicle/menu';
let vehicle = {};

const getVehicle = (request, response) => respondJSON(request, response, 200, vehicle);

const getVehicleMeta = (request, response) => respondJSONMeta(request, response, 200);

const setVehicle = (request, response, body) => {
  const responseJSON = {
    message: 'At least one piece of vehicle information is missing',
  };

  if (!body.year || !body.make || !body.model || !body.options) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!_.isEqual(vehicle, body)) {
    responseCode = 201;
  }

  vehicle = body;

  if (responseCode === 201) {
    responseJSON.message = 'Vehicle Updated Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const getYears = async (request, response) => {
  const yearsResponse = await fetch(`${URL}/year`, {
    method: 'GET',
    headers: request.headers,
  });
  if (yearsResponse.ok) {
    const years = await yearsResponse.json();
    respondJSON(request, response, 200, years);
  } else {
    const responseJSON = {
      message: 'Failed to get vehicle year info',
      id: 'responseFailed',
    };
    respondJSON(request, response, 500, responseJSON);
  }
};

const getYearsMeta = (request, response) => respondJSONMeta(request, response, 200);

const getMakes = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const url = `${URL}/make?${query}`;
  const makesResponse = await fetch(url, {
    method: 'GET',
    headers: request.headers,
  });
  if (makesResponse.ok) {
    const makes = await makesResponse.json();
    respondJSON(request, response, 200, makes);
  } else {
    const responseJSON = {
      message: 'Failed to get vehicle make info',
      id: 'responseFailed',
    };
    respondJSON(request, response, 500, responseJSON);
  }
};

const getMakesMeta = (request, response) => respondJSONMeta(request, response, 200);

const getModels = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const url = `${URL}/model?${query}`;
  const makesResponse = await fetch(url, {
    method: 'GET',
    headers: request.headers,
  });
  if (makesResponse.ok) {
    const makes = await makesResponse.json();
    respondJSON(request, response, 200, makes);
  } else {
    const responseJSON = {
      message: 'Failed to get vehicle model info',
      id: 'responseFailed',
    };
    respondJSON(request, response, 500, responseJSON);
  }
};

const getModelsMeta = (request, response) => respondJSONMeta(request, response, 200);

const getOptions = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const url = `${URL}/options?${query}`;
  const makesResponse = await fetch(url, {
    method: 'GET',
    headers: request.headers,
  });
  if (makesResponse.ok) {
    const makes = await makesResponse.json();
    respondJSON(request, response, 200, makes);
  } else {
    const responseJSON = {
      message: 'Failed to get vehicle options info',
      id: 'responseFailed',
    };
    respondJSON(request, response, 500, responseJSON);
  }
};

const getOptionsMeta = (request, response) => respondJSONMeta(request, response, 200);

const getVehicleProfile = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const { id } = queryS.parse(query);

  const fuelDataRes = await fetch(
    `https://www.fueleconomy.gov/ws/rest/v2/${id}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  );
  const json = await fuelDataRes.json();
  respondJSON(request, response, 200, json);
};

const getVehicleProfileMeta = (request, response) => respondJSONMeta(request, response, 200);

const getFuelPrices = async (request, response) => {
  const fuelPricesRes = await fetch(
    'https://www.fueleconomy.gov/ws/rest/fuelprices',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  );
  const json = await fuelPricesRes.json();
  respondJSON(request, response, 200, json);
};

const getFuelPricesMeta = (request, response) => respondJSONMeta(request, response, 200);

const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The data you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};

// function for 404 not found without message
const notFoundMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getYears,
  getYearsMeta,
  getMakes,
  getMakesMeta,
  getModels,
  getModelsMeta,
  getOptions,
  getOptionsMeta,
  getVehicle,
  getVehicleMeta,
  setVehicle,
  getVehicleProfile,
  getVehicleProfileMeta,
  getFuelPrices,
  getFuelPricesMeta,
  notFound,
  notFoundMeta,
};
