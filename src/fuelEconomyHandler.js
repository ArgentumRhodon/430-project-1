const fuelEconomyURL = "https://www.fueleconomy.gov/ws/rest/vehicle/menu";

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.write(JSON.stringify(object));
  response.end();
};

const getVehicleInfo = async (endpoint) => {
  const res = await fetch(`${fuelEconomyURL}/${endpoint}`, {
    headers: { Accept: "application/json" },
  });
  return await res.json();
};

const getVehicleYears = async (request, response) => {
  const responseJSON = await getVehicleInfo("year");

  respondJSON(request, response, 200, responseJSON);
};

const getVehicleMake = async (request, response, parsedURL) => {
  const query = parsedURL.query;
  const responseJSON = await getVehicleInfo(`make?${query}`);

  respondJSON(request, response, 200, responseJSON);
};

module.exports = {
  getVehicleYears,
  getVehicleMake,
};
