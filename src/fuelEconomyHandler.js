const fuelEconomyURL = "https://www.fueleconomy.gov/ws/rest/vehicle/menu";

const getVehicleYears = async (request, response) => {
  const res = await fetch(
    `https://www.fueleconomy.gov/ws/rest/vehicle/menu/year`,
    {
      headers: { Accept: "application/json" },
    }
  );
  const responseJSON = await res.json();
  response.writeHead(200, { "Content-Type": "application/json" });
  response.write(JSON.stringify(responseJSON));
  response.end();
};

module.exports = {
  getVehicleYears,
};
