/**
 * Controller for the vis.js graph
 * Written by Austin Barrett, Max Meyer, and Kyle Sturmer
 */

angular.module('rtApp')
        .controller('NewGraphController', function ($scope,$http,$location,Login,Express) {

  //Check if user is logged in
  $scope.loginObject = Login
  $scope.failureMessage = ""

  $scope.createGraph = function (name) {
    var request = Express.requestFactory("newGraph")
    $http.post(
            request.build(),
            JSON.stringify({
              "name": name,
              "u": $scope.loginObject.username,
              "key": $scope.loginObject.key
            })
    )
    .then(function onSuccess(response) {
        if (response.status == 200) {
          $location.path(`/graph/${$scope.loginObject.username}/${response.data.graphId}`)
        } else if (response.status == 403){
          $scope.loginObject.logout()
        }
    },
    function onError(response) {
        $scope.failureMessage = response.data.message
        if (response.status == 403){
          $scope.loginObject.logout()
        }
    })
  }


})
