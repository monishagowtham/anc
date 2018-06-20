rtApp.factory('Login', function($http,Express) {
  var object = {
    loggedIn: false,
    username: undefined,
    key: undefined,
    graphs: [],
    setRegister: function() {},

    login: (username, password, stayLoggedIn, callback, err)=>{
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
        object.updateGraphs()
        callback()
      },
      function onError(response) {
        if (response && response.data && response.data.message)
        {
          err(response.data.message)
        }
      })
    },

    updateGraphs: function() {
      var request = Express.requestFactory("listGraphs")
      .addParameter("u", object.username)
      $http.get(request.build()).then(
        function onSuccess(response) {
          object.graphs = response.data
        },
        function onError(response) {
          object.graphs = []
        }
      )
    },

    logout: ()=>{
      object.loggedIn = false
      object.loginMessage = ""
      object.username = undefined
      object.key = undefined
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
        object.updateGraphs()
      } else {
        expiration = localStorage.getItem("expires")
        if (expiration != undefined && expiration > Date.now()/1000) {
          object.username = localStorage.getItem("username")
          object.key = localStorage.getItem("key")
          object.loggedIn = true
          object.updateGraphs()
        }
      }
    }
  }
  return object
})
