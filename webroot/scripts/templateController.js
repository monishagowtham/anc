// AngularJS controller for Template

angular.module('rtApp')
        .controller('TemplateController', function ($scope, $sce, $location, Login) {

    $scope.currentpage = $location.path().slice(1).split('/')
    console.log($scope.currentpage)

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
})
