require("dotenv/config");
const http = require("http");
const url = require("url");
const clientHandler = require("./clientHandler");
const fuelEconomyHandler = require("./fuelEconomyHandler");

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    "/": clientHandler.getIndex,
    "/client.js": clientHandler.getClientJS,
    "/vehicle": fuelEconomyHandler.getVehicleRecord,
    index: clientHandler.getIndex,
  },
  HEAD: {},
  POST: {},
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  const endpoint = urlStruct[request.method][parsedURL.pathname];
  if (endpoint) {
    return endpoint(request, response);
  }
  return urlStruct.GET.index(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
