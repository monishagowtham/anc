// Create Angular App (Add app-wide things here)
var rtApp = angular.module('rtApp',[])
rtApp.factory('Login', function() {
  return { loginFunction: (username, password)=>{}, loggedIn: false, loginMessage: "", username: "" }
})
