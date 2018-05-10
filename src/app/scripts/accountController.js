angular.module('rtApp')
        .controller('AccountController', function ($scope,$http,$routeParams,Login,Express) {
        $scope.loginObject = Login
        $scope.loginObject.checkSession()
        $scope.username = $routeParams.user || $scope.loginObject.username
        $scope.graphs = []
        $scope.name = ""

        var request = Express.requestFactory("listGraphs").addParameter("u",$scope.username)
        $http.get(request.build()).then(
          function onSuccess(response) {
            if (response.status == 200) {
              $scope.graphs = response.data
            } else {
              console.log(response)
            }
          },
          function onError(response) {

          }
        )
        request = Express.requestFactory("getName").addParameter("u",$scope.username)
        $http.get(request.build()).then(
          function onSuccess(response) {
            if (response.status == 200) {
              $scope.name = response.data.name
            } else {
              console.log(response)
            }
          },
          function onError(response) {

          }
        )
    }
)
