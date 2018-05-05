// AngularJS controller for NavBar

angular.module('rtApp')
        .controller('NavBarController', function ($scope, $sce, Login) {
    $scope.loginObject = Login
    $scope.login = function (username,password,stayLoggedIn) {
      $scope.loginObject.loginFunction(username,password,stayLoggedIn)
    }
})
