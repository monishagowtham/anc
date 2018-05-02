// AngularJS controller for NavBar

angular.module('rtApp')
        .controller('NavBarController', ($scope, $sce, Login) => {
    $scope.loginObject = Login
    $scope.login = function (username,password) {
      $scope.loginObject.loginFunction(username,password)
    }
})
