const fuelEconomyURL = "https://www.fueleconomy.gov/ws/rest/vehicle/menu";

const respond = (request, response, status, object) => {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.write(object);
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

  respond(request, response, 200, JSON.stringify(responseJSON));
};

module.exports = {
  getVehicleYears,
};
