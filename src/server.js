const http = require("http");
const url = require("url");
const clientHandler = require("./clientHandler");
const vehicleHandler = require("./vehicleResponse");
const routeHandler = require("./routeHandler");
const tripHandler = require("./tripHandler");

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on("error", (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on("data", (chunk) => {
    body.push(chunk);
  });

  request.on("end", () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = JSON.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

const urlStruct = {
  GET: {
    "/": clientHandler.getIndex,
    "/client.js": clientHandler.getJS,
    "/vehicle": vehicleHandler.getVehicle,
    "/route": routeHandler.getRoute,
    "/year": vehicleHandler.getYears,
    "/make": vehicleHandler.getMakes,
    "/model": vehicleHandler.getModels,
    "/options": vehicleHandler.getOptions,
    "/fuel": vehicleHandler.getFuelPrices,
    "/vehicleProfile": vehicleHandler.getVehicleProfile,
    "/trip": tripHandler.getTrip,
    // "/getUsers": jsonHandler.getUsers,
    index: clientHandler.getIndex,
    notFound: vehicleHandler.notFound,
  },
  HEAD: {
    "/vehicle": vehicleHandler.getVehicleMeta,
    "/route": routeHandler.getRouteMeta,
    "/trip": tripHandler.getTripMeta,
    "/year": vehicleHandler.getYearsMeta,
    "/make": vehicleHandler.getMakesMeta,
    "/model": vehicleHandler.getModelsMeta,
    "/options": vehicleHandler.getOptionsMeta,
    "/fuel": vehicleHandler.getFuelPricesMeta,
    "/vehicleProfile": vehicleHandler.getVehicleProfileMeta,
    // "/getUsers": jsonHandler.getUsersMeta,
    notFound: vehicleHandler.notFoundMeta,
  },
  POST: {
    "/vehicle": vehicleHandler.setVehicle,
    "/route": routeHandler.setRoute,
    "/trip": tripHandler.addTrip,
    // "/addUser": jsonHandler.addUser,
    notFound: vehicleHandler.notFoundMeta,
  },
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  if (!urlStruct[request.method]) {
    return urlStruct.HEAD.notFound(request, response);
  }

  if (request.method === "POST") {
    if (urlStruct.POST[parsedURL.pathname]) {
      return parseBody(request, response, urlStruct.POST[parsedURL.pathname]);
    }
  } else if (urlStruct[request.method][parsedURL.pathname]) {
    return urlStruct[request.method][parsedURL.pathname](
      request,
      response,
      parsedURL
    );
  }
  return urlStruct[request.method].notFound(request, response);
};

http.createServer(onRequest).listen(port);
