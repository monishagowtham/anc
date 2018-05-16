// AngularJS controller for Template

angular.module('rtApp')
        .controller('TemplateController', function ($scope, $sce, $location, $rootScope, Login, Title) {

    $scope.currentpage = $location.path().slice(1).split('/')
    //console.log($scope.currentpage)

    $scope.loginObject = Login
    $scope.loginObject.checkSession()

    $scope.login = function (username,password,stayLoggedIn) {
      $scope.loginObject.loginFunction(username,password,stayLoggedIn)
    }

    // Set values to setup login/register modals
    $scope.register = false
    $scope.insideModal = true

    $scope.fillLogin = function () {
      $scope.register = false
    }

    $scope.fillRegister = function () {
      $scope.register = true
    }

    $scope.titleService = Title

    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      if (current.$$route.title != "Graph") {
        $scope.titleService.setTitle(current.$$route.title)
        $scope.scrollableBody = true
      } else {
        $scope.scrollableBody = false
      }
    })

    $scope.showConsentPopup = false

    $scope.consentToStorage = function() {
      localStorage.setItem("consent",true)
      $scope.showConsentPopup = false
    }

    if (localStorage.getItem("consent") === null) {
      $scope.showConsentPopup = true
    }
})
