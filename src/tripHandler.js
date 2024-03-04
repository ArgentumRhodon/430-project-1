let trip = {};
const _ = require('lodash');
const { respondJSON, respondJSONMeta } = require('./jsonResponse');

const getTrip = (request, response) => respondJSON(request, response, 200, trip);

const getTripMeta = (request, response) => respondJSONMeta(request, response, 200);

const addTrip = (request, response, body) => {
  const responseJSON = {
    message: 'At least one piece of trip information is missing',
  };

  if (
    !body.vehicle
    || !body.locations
    || !body.time
    || !body.miles
    || !body.cost
    || !body.vehicleImgURL
  ) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (_.isEqual(trip, body)) {
    responseCode = 204;
  } else {
    trip = body;
  }

  if (responseCode === 201) {
    responseJSON.message = 'Trip Updated Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  getTrip,
  getTripMeta,
  addTrip,
};
