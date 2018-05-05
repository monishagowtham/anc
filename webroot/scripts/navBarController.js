// AngularJS controller for NavBar

angular.module('rtApp')
        .controller('NavBarController', ($scope, $sce, Login) => {
    $scope.loginObject = Login
    setInterval(() => {console.log($scope.loginObject)}, 5000)
    $scope.login = function (username,password,stayLoggedIn) {
      $scope.loginObject.loginFunction(username,password,stayLoggedIn)
    }
})
