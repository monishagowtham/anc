angular.module('rtApp')
        .controller('RegistrationController',($scope,$http,$sce) => {

          $scope.modalVisible = false;

          $scope.toggleModal = () => {
            $scope.modalVisible = !$scope.modalVisible
          }
    })
