let numTrips = 0;
const trips = {};

const addTrip = (request, response, body) => {
  trips[numTrips] = body;

  const headers = {
    'Content-Type': 'application/json',
  };

  numTrips++;

  response.writeHead(201, headers);
  response.end();
};

const getTrips = (request, response) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(200, headers);
  response.write(JSON.stringify(trips));
  response.end();
};

module.exports = {
  addTrip,
  getTrips,
};
