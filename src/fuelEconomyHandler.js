const fuelEconomyURL = 'https://www.fueleconomy.gov/ws/rest/vehicle/menu';

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const getVehicleInfo = async (endpoint) => {
  const res = await fetch(`${fuelEconomyURL}/${endpoint}`, {
    headers: { Accept: 'application/json' },
  });
  return res.json();
};

const getVehicleYears = async (request, response) => {
  const responseJSON = await getVehicleInfo('year');

  respondJSON(request, response, 200, responseJSON);
};

const getVehicleMake = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const responseJSON = await getVehicleInfo(`make?${query}`);

  respondJSON(request, response, 200, responseJSON);
};

const getVehicleModel = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const responseJSON = await getVehicleInfo(`model?${query}`);

  respondJSON(request, response, 200, responseJSON);
};

const getVehicleOptions = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  const responseJSON = await getVehicleInfo(`options?${query}`);

  respondJSON(request, response, 200, responseJSON);
};

module.exports = {
  getVehicleYears,
  getVehicleMake,
  getVehicleModel,
  getVehicleOptions,
};
