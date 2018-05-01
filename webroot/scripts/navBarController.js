// AngularJS controller for NavBar

angular.module('rtApp')
        .controller('NavBarController', ['$scope', '$sce', ($scope, $sce) => {
  // Set the footer
  $scope.footer = $sce.trustAsHtml("<footer class='container'><p class='float-right'><a href='#'>Back to top</a></p><p>&copy; 2018 Somebody &middot; <a href='https://www.youtube.com/watch?v=7YvAYIJSSZY'>Privacy</a></p></footer>")
}])
