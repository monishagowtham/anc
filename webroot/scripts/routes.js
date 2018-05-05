angular.module('rtApp')
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/", {
    templateUrl: "/views/home.html",
    controller: "HomeController as hc"
  })
  .when("/index", {
    templateUrl: "/views/home.html",
    controller: "HomeController as hc"
  })
  .when("/index.html", {
    templateUrl: "/views/home.html",
    controller: "HomeController as hc"
  })
  .when("/account", {
    templateUrl: "/views/account.html",
    controller: "AccountController as ac"
  })
  .when("/graph/:user/:graph/:node", {
    templateUrl: "/views/graph.html",
    controller: "GraphController as gc"
  })
  .when("/privacy", {
    templateUrl: "/views/privacy.html"
  })
  .when("/register", {
    templateUrl: "/views/register.html",
    controller: "LoginController as lc"
  })
  .when("/login", {
    templateUrl: "/views/login.html",
    controller: "LoginController as lc"
  })

  $locationProvider.html5Mode(true)

})
