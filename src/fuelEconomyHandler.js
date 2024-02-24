const getVehicleRecord = async (request, response) => {
  const res = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/31873`, {
    headers: { Accept: "application/json" },
  });

  const resJson = await res.json();

  response.writeHead(200, { "Content-Type": "application/json" });
  response.write(JSON.stringify(resJson));
  response.end();
};

module.exports = {
  getVehicleRecord,
};
