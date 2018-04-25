/**
 * Defines a simple vis.js graph for testing
 * Written by Austin Barrett
 */

angular.module('spaghettiApp').controller('GraphController', ['$scope','$http', function ($scope,$http) {

  $scope.nodes = new vis.DataSet([])
  $scope.edges = new vis.DataSet([])
  var edgeid = 0

  $http({
        method : "GET",
        url : "http://localhost:8005/api/everything"
    })
    .then(function mySuccess(response) {
        console.log(response.data)
    },
    function myError(response) {
        console.log("I can't believe you've done this.")
    });

  $http({
          method : "GET",
          url : "http://localhost:8005/api/nodes"
      })
      .then(function mySuccess(response) {
        response.data.neoRecords.forEach(function(record){
            $scope.nodes.add([{id: record.properties.id.low, label: record.properties.name, hidden: false}])
        })
      },
      function myError(response) {
          console.log("I can't believe you've done this.")
      });

  $http({
          method : "GET",
          url : "http://localhost:8005/api/relationships"
        })
        .then(function mySuccess(response) {
          response.data.neoRecords.forEach(function(record){
            $scope.edges.add([{id: edgeid, from: record.from, to: record.to, label: record.type, arrows: 'from', hidden: false}])
            edgeid ++ // need to send data to relationshp list
          });
        },
        function myError(response) {
            console.log("I can't believe you've done this.")
        });

        console.log($scope.rawNodes)

 // I had trouble getting ng-repeat to work properly with vis.DataSet, so
 // I added temporary lists of all values


  $scope.tempNames = [
    'Alice',
    'Bob',
    'Charlie',
    'David',
    'Eve'
  ]

  $scope.tempRelationships = [
    'mother',
    'son',
    'brother',
    'beneficiary',
    'business partner',
    'friend',
    'acquaintance'
  ]





  var graph = document.getElementById('graph')
  $scope.data = {
    nodes: $scope.nodes,
    edges: $scope.edges
  }
  var options = {}
  $scope.network = new vis.Network(graph, $scope.data, options)

  $scope.removeNode = function() {
    $scope.nodes.remove({id: document.getElementById('nodeId').value})
  }

  $scope.hideNode = function() {
    var hide = true;
    if ($scope.nodes.get(document.getElementById('nodeId').value).hidden) {
      hide = false;
    }
    $scope.nodes.update({id: document.getElementById('nodeId').value, hidden : hide})
  }

  $scope.hideNode = function() {
    var label = document.getElementById('nodeLabel').value
    var edges = $scope.nodes.get({
      filter: function (node) {
        return (node.label == label)
      }
    })
    edges.forEach(function(node){
      var id = node.id
      if (node.hidden) {
        $scope.nodes.update({id: id, hidden: false})
      } else {
        $scope.nodes.update({id: id, hidden: true})
      }
    })
  }

  $scope.hideNodeCheckbox = function(label) {
    var checked = document.getElementById('checkbox' + label).checked
    var nodes = $scope.nodes.get({
      filter: function (node) {
        return (node.label == label)
      }
    })
    nodes.forEach(function(node){
      var id = node.id
      $scope.nodes.update({id: id, hidden: !checked})
    })
  }

  $scope.hideEdge = function() {
    var label = document.getElementById('edgeLabel').value
    var edges = $scope.edges.get({
      filter: function (edge) {
        return (edge.label == label)
      }
    })
    edges.forEach(function(edge){
      var id = edge.id
      if (edge.hidden) {
        $scope.edges.update({id: id, hidden: false})
      } else {
        $scope.edges.update({id: id, hidden: true})
      }
    })
  }

  $scope.hideEdgeCheckbox = function(label) {
    var checked = document.getElementById('checkbox' + label).checked
    var edges = $scope.edges.get({
      filter: function (edge) {
        return (edge.label == label)
      }
    })
    edges.forEach(function(edge){
      var id = edge.id
      $scope.edges.update({id: id, hidden: !checked})
    })
  }

  $scope.getFirstNodeWithLabel = function(label) {
    var nodes = $scope.nodes.get({
      filter: function (node) {
        return (node.label == label)
      }
    })
    return nodes[0]
  }

  $scope.getFirstEdgeWithLabel = function(label) {
    var edges = $scope.edges.get({
      filter: function (edge) {
        return (edge.label == label)
      }
    })
    return edges[0]
  }

}])
