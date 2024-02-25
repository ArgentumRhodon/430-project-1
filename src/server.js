require('dotenv/config');
const http = require('http');
const url = require('url');
const clientHandler = require('./clientHandler');
const fuelEconomyHandler = require('./fuelEconomyHandler');
const tripHandler = require('./tripHandler');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = JSON.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

const urlStruct = {
  GET: {
    '/': clientHandler.getIndex,
    '/client.js': clientHandler.getClientJS,
    '/years': fuelEconomyHandler.getVehicleYears,
    '/make': fuelEconomyHandler.getVehicleMake,
    '/model': fuelEconomyHandler.getVehicleModel,
    '/options': fuelEconomyHandler.getVehicleOptions,
    '/trips': tripHandler.getTrips,
    index: clientHandler.getIndex,
  },
  HEAD: {},
  POST: {
    '/addTrip': tripHandler.addTrip,
  },
};

const handlePost = (request, response, parsedURL) => {
  if (urlStruct.POST[parsedURL.pathname]) {
    parseBody(request, response, tripHandler.addTrip);
  }
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  if (request.method === 'POST') {
    return handlePost(request, response, parsedURL);
  }

  const endpoint = urlStruct[request.method][parsedURL.pathname];
  if (endpoint) {
    return endpoint(request, response, parsedURL);
  }
  return urlStruct.GET.index(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
