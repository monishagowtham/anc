const httpServer = require('http-server-with-default')
const config = new httpServer.Config;

config.port = 8000
httpServer.onRequest = handleRequest
httpServer.deploy( config )

/**
* Called when a request is made to the http-server
* @param request - http request
* @param response - http server response
* @param serve - function called to serve the request
* @return true on completion
*/
function handleRequest(request, response, serve) {
  if (request.uri.path == '/example') {
    serve(request, response, JSON.stringify({
      uri:request.uri,
      message:'you found me',
      query: request.query
    }))
    return true
  }
  else {
    return false
  }
}//