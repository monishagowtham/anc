angular.module('rtApp')
.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/", {
    title: "Home",
    templateUrl: "/views/home.html",
    controller: "HomeController as hc"
  })
  .when("/index", {
    title: "Home",
    templateUrl: "/views/home.html",
    controller: "HomeController as hc"
  })
  .when("/index.html", {
    title: "Home",
    templateUrl: "/views/home.html",
    controller: "HomeController as hc"
  })
  .when("/account/:user?", {
    title: "Account",
    templateUrl: "/views/account.html",
    controller: "AccountController as ac"
  })
  .when("/graph/:user?/:graph?/:node?", {
    title: "Graph",
    templateUrl: "/views/graph.html",
    controller: "GraphController as gc"
  })
  .when("/new", {
    title: "New Graph",
    templateUrl: "/views/newgraph.html",
    controller: "NewGraphController as ngc"
  })
  .when("/privacy", {
    title: "Privacy",
    templateUrl: "/views/privacy.html"
  })
  .when("/register", {
    title: "Register",
    templateUrl: "/views/register.html",
    controller: "LoginController as lc"
  })
  .when("/login", {
    title: "Login",
    templateUrl: "/views/login.html",
    controller: "LoginController as lc"
  })

  $locationProvider.html5Mode(true)

})
