angular.module('rtApp')
        .controller('LoginController', function ($scope,$http,$location,Express,Login) {

          var path = $location.path()
          $scope.insideModal = (path !== '/register' && path !== '/login')
          $scope.loginObject = Login
          $scope.showMismatch = false
          $scope.loginErrorMessage = ""
          $scope.hasLoginError = false

          $scope.login = function (username,password,stayLoggedIn) {
            $scope.loginObject.login(username,
              password,
              stayLoggedIn,
               () => {
                 $scope.hasLoginError = false
                 if ($scope.insideModal) {
                   $('#loginModal').modal('hide')
                 } else {
                   $location.path('/account')
                 }
              },
              (message) => {
                console.log("Show Incorrect Username or Password") //TODO: add to alert
                setTimeout(() => {
                  console.log("Hide Incorrect Username or Password") //TODO: add to alert
                },1500)
                if (message) {
                  $scope.loginErrorMessage = message
                  $scope.hasLoginError = true
                }
              })
          }

          $scope.fillRegister = $scope.loginObject.fillRegister

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
              $scope.hasLoginError = false
              $scope.login(username, password, stayLoggedIn)
            },
            function onError(response) {
                $scope.loginObject.logout()
                if (response && response.data && response.data.message) {
                  $scope.loginErrorMessage = response.data.message
                  $scope.hasLoginError = true
                }
            })
          }
    })
