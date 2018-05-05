angular.module('rtApp')
        .controller('LoginController', function ($scope,$http,$location,Express,Login) {
          $scope.insideModal = $scope.insideModal || false
          $scope.loginObject = Login
          $scope.showMismatch = false

          $scope.login = function (username,password,stayLoggedIn) {
            $scope.loginObject.login(username,
              password,
              stayLoggedIn,
               () => {
                 if ($scope.insideModal) {
                   $('#loginModal').modal('hide')
                 } else {
                   $location.path('/account')
                 }
              },
              () => {
                console.log("Show Incorrect Username or Password") //TODO: add to alert
                setTimeout(() => {
                  console.log("Hide Incorrect Username or Password") //TODO: add to alert
                },1500)
              })
          }

          $scope.validate = function (password, repeat) {
            var result = password === repeat
            $scope.showMismatch = !result
            return result
          }

          $scope.register = function (username, password, stayLoggedIn, displayname) {
            var request = Express.requestFactory("registerUser")
            $http.post(
              request.build(),
              JSON.stringify({
                "u": username,
                "p": password,
                "name": displayname
              })
            )
            .then(function onSuccess(response) {
              $scope.login(username, password, stayLoggedIn)
            },
            function onError(response) {
                $scope.loginObject.logout()
            })
          }
    })
