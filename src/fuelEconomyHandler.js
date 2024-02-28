const fuelEconomyURL = "https://www.fueleconomy.gov/ws/rest/vehicle/menu";

const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.write(JSON.stringify(object));
  response.end();
};

const getVehicleInfo = async (request, response, parsedURL) => {
  const { query } = parsedURL;
  let url = `${fuelEconomyURL}/${parsedURL.pathname.split("/")[2]}`;
  if (query) {
    url += `?${query}`;
  }
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  const responseJSON = await res.json();
  respondJSON(request, response, 200, responseJSON);
};

module.exports = {
  getVehicleInfo,
};
