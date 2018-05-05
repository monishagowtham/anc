angular.module('rtApp')
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/", {
    templateUrl: "/views/home.html",
    controller: "HomeController"
  })
  .when("/index", {
    templateUrl: "/views/home.html",
    controller: "HomeController"
  })
  .when("/index.html", {
    templateUrl: "/views/home.html",
    controller: "HomeController"
  })
  .when("/account", {
    templateUrl: "/views/account.html",
    controller: "AccountController"
  })
  .when("/graph", {
    templateUrl: "/views/graph.html",
    controller: "GraphController"
  })
  .when("/privacy", {
    templateUrl: "/views/privacy.html"
  })
  .when("/register", {
    templateUrl: "/views/register.html",
    controller: "RegistrationController"
  })
  .when("/login", {
    templateUrl: "/views/login.html",
    controller: "LoginController"
  })

  $locationProvider.html5Mode(true)

})
