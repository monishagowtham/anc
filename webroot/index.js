const httpServer = require('http-server-with-default')
const http = require('http')
const config = new httpServer.Config;

config.port = 8000
httpServer.onRequest = handleRequest
httpServer.deploy( config )
console.log("Kyle, the server is running on port " + config.port)

/**
* Called when a request is made to the http-server
* @param request - http request
* @param response - http server response
* @param serve - function called to serve the request
* @return true on completion
*/
function handleRequest(request, response, serve) {
  if (request.uri.path == '/istheserverrunning') {
    serve(request, response, JSON.stringify({
      uri:request.uri,
      message:'yes',
      query: request.query
    }))
    return true
  }
  else {
    return false
  }
}//
