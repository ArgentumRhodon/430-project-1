let userRoute = {};
const _ = require('lodash');
const { respondJSON, respondJSONMeta } = require('./jsonResponse');

const getRoute = (request, response) => respondJSON(request, response, 200, userRoute);

const getRouteMeta = (request, response) => respondJSONMeta(request, response, 200);

const setRoute = (request, response, body) => {
  const responseJSON = {
    message: 'Route information is missing',
  };

  if (!body) {
    responseJSON.id = 'noInfo';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!_.isEqual(userRoute, body)) {
    responseCode = 201;
  }

  userRoute = body;

  if (responseCode === 201) {
    responseJSON.message = 'Route Updated Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  getRoute,
  getRouteMeta,
  setRoute,
};
