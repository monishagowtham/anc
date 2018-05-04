// Create Angular App (Add app-wide things here)
var rtApp = angular.module('rtApp',[])
rtApp.factory('Login', function() {
  return { loginFunction: (username, password)=>{}, loggedIn: false, loginMessage: "", username: "" }
})
rtApp.factory('Express', function($http) {
  var _protocol = "http"
  var _domain = "localhost"
  var _port = 8000
  // Get info from config file (if it exists)
  $http({
          method : "GET",
          url : "/api/config"
  })
  .then(function mySuccess(response) {
    _protocol = response.data.protocol
    _domain = response.data.domain
    _port = response.data.port
  },
  function myError(response) {
    console.log("Failed to retrieve system configuration")
  })
  return {
    requestFactory : (call) => {
      var thisObj = {
        _baseUrl : `${_protocol}://${_domain}:${_port}/api/${call}?`,
        _params : [{key: 1, value: 2}, {key: 2, value: 1}],
        addParameter : (key, value) => {
          thisObj._params.push ({
            key: key,
            value: value
          })
          return thisObj
        },
        build : ()=> {
          var request = thisObj._baseUrl
          if (thisObj._params != undefined) {
            thisObj._params.forEach((parameter) => {
              request += `${parameter.key}=${parameter.value}&`
            })
          }
          return request.slice(0,-1)
        }
      }
      return thisObj
    }
  }
})
