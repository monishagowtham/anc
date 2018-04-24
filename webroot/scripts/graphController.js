/**
 * Defines a simple vis.js graph for testing
 * Written by Austin Barrett
 */

angular.module('spaghettiApp').controller('GraphController', ['$scope','$http', function ($scope,$http) {

  $http({
        method : "GET",
        url : "http://localhost:8005/api/everything"
    }).then(function mySuccess(response) {
        console.log(response.data)
    }, function myError(response) {
        console.log("I can't believe you've done this.")
    });

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

  $scope.nodes = new vis.DataSet([
    {id: 1, label: 'Alice', hidden: false},
    {id: 2, label: 'Bob', hidden: false},
    {id: 3, label: 'Charlie', hidden: false},
    {id: 4, label: 'David', hidden: false},
    {id: 5, label: 'Eve', hidden: false}
  ])

  $scope.edges = new vis.DataSet([
    {id: 0, from: 1, to: 2, label: 'mother', arrows: 'from', hidden: false},
    {id: 1, from: 2, to: 1, label: 'son', arrows: 'from', hidden: false},
    {id: 2, from: 1, to: 4, label: 'mother', arrows: 'from', hidden: false},
    {id: 3, from: 4, to: 1, label: 'son', arrows: 'from', hidden: false},
    {id: 4, from: 2, to: 4, label: 'brother', arrows:'to,from', hidden: false},
    {id: 5, from: 4, to: 5, label: 'beneficiary', arrows: 'to', hidden: false},
    {id: 6, from: 4, to: 5, label: 'business partner', arrows: 'to, from', hidden: false},
    {id: 7, from: 2, to: 5, label: 'friend', arrows: 'to, from', hidden: false},
    {id: 8, from: 1, to: 3, label: 'acquaintance', arrows: 'to, from', hidden: false}
  ])

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
