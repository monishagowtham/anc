// AngularJS controller for NavBar

angular.module('rtApp').controller('NavBarController', ['$scope', '$sce', function ($scope, $sce) {
  var mainNavObject = new Menu()
    .add(new MenuItem("Home", "/"))
	//.add(new MenuItem("Next item", "/location")) // keep adding more like this

  $scope.mainNav = $sce.trustAsHtml(mainNavObject.toHtmlAsString())
  $scope.footer = $sce.trustAsHtml("<footer class='container'><p class='float-right'><a href='#'>Back to top</a></p><p>&copy; 2018 Somebody &middot; <a href='https://www.youtube.com/watch?v=7YvAYIJSSZY'>Privacy</a></p></footer>")
}])
