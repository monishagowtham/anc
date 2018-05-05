// Create Angular App (Add app-wide things here)
var rtApp = angular.module('rtApp',['ngRoute'])

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

rtApp.factory('Login', function($http,Express) {
  var object = {
    login: (username, password, stayLoggedIn)=>{
      var request = Express.requestFactory("requestApiKey")
      $http.post(
        request.build(),
        JSON.stringify({
          "u": username,
          "p": password
        })
      )
      .then(function onSuccess(response) {
        console.log("success")
        object.key = response.data.key
        object.loggedIn = true
        object.username = username
        if (stayLoggedIn) {
          localStorage.setItem("username",username)
          localStorage.setItem("key",object.key)
          localStorage.setItem("expires",Date.now()/1000 + 200000)
        } else {
          sessionStorage.setItem("username",username)
          sessionStorage.setItem("key",object.key)
          sessionStorage.setItem("expires",Date.now()/1000 + 200000)
        }
      },
      function onError(response) {
          object.loginMessage = "Incorrect Username or Password"
          setTimeout(() => {
            object.loginMessage = ""
          },1500)
      })
    },
    loggedIn: false, loginMessage: "",
    username: "",
    key: "",
    logout: ()=>{
      object.loggedIn = false
      object.loginMessage = ""
      object.username = ""
      sessionStorage.removeItem("username")
      sessionStorage.removeItem("key")
      sessionStorage.removeItem("expires")
      localStorage.removeItem("username")
      localStorage.removeItem("key")
      localStorage.removeItem("expires")
    },
    checkSession: ()=>{
      var expiration = sessionStorage.getItem("expires")
      if (expiration != undefined && expiration > Date.now()/1000) {
        object.username = sessionStorage.getItem("username")
        object.key = sessionStorage.getItem("key")
        object.loggedIn = true
      } else {
        expiration = localStorage.getItem("expires")
        if (expiration != undefined && expiration > Date.now()/1000) {
          object.username = localStorage.getItem("username")
          object.key = localStorage.getItem("key")
          object.loggedIn = true
        }
      }
    }
  }
  return object
})
