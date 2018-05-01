/**
 * Controller for the vis.js graph
 * Written by Austin Barrett, Max Meyer, and Kyle Sturmer
 */

angular.module('rtApp')
        .controller('GraphController',['$scope','$http', ($scope,$http) => {

  /*
   * Declare empty arrays to fill with info from database
   */

  $scope.nodes = new vis.DataSet([])
  $scope.edges = new vis.DataSet([])
  $scope.filterRelationships = []

  /*
   * Used to ensure all edge ids are unique since they are required for vis.js
   * but not important to us
   */
  var edgeId = 0

  /*
   * Get all nodes from the Express API and add them to $scope.nodes to be used
   * in the graph
   */
  $http({
      method : "GET",
      url : "http://localhost:8005/api/nodes"
  })
  .then(function mySuccess(response) {
    response.data.neoRecords.forEach(function(record){
        $scope.nodes.add([{id: record.properties.id.low,
          label: record.properties.name, hidden: false}])
    })
  },
  function myError(response) {
      console.log("Failed to retrieve nodes from database")
  });

  /*
   * Get all relationships from the Express API and add them to
   * $scope.relationships to be used in graph
   */
  $http({
          method : "GET",
          url : "http://localhost:8005/api/relationships"
  })
  .then(function mySuccess(response) {
    response.data.neoRecords.forEach(function(record){
      $scope.edges.add([{id: edgeId, from: record.from, to: record.to,
                        label: record.type, arrows: 'from', hidden: false}])

      // Loop through relationships and push to filterRelationships
      var typeNew = true
      $scope.filterRelationships.forEach((filterRel) => {
        if (filterRel === record.type) {
          typeNew = false
        }
      })
      if (typeNew) {
        $scope.filterRelationships.push(record.type)
      }

      // increment edgeId so all edge ids are unique
      edgeId ++
    });
  },
  function myError(response) {
      console.log("Failed to retrieve relationships from database")
  });

  /*
   * Create the graph
   */
  var graph = document.getElementById('graph')
  $scope.data = {
    nodes: $scope.nodes,
    edges: $scope.edges
  }
  $scope.options = {}
  $scope.network = new vis.Network(graph, $scope.data, $scope.options)


  /***************************************************************************
   * Helper Functions
   ***************************************************************************/

  /*
   * Function to a remove a node from the graph
   */
  $scope.removeNode = function() {
    $scope.nodes.remove({id: document.getElementById('nodeId').value})
  }

  /* TURN OFF GRAPH PHYSICS BUTTON FUNCTION */

  $scope.jiggleToggle = function() {
    $scope.options.physics.enabled = !$scope.options.physics.enabled
    console.log($scope.options)
    $scope.network.setOptions($scope.options)

    }
  /*
   * This version was here too. Kept it for now in case I kept the wrong one
   * since it still needs to be used later
   *//*
  $scope.hideNode = function() {
    var hide = true;
    if ($scope.nodes.get(document.getElementById('nodeId').value).hidden) {
      hide = false;
    }
    $scope.nodes.update({id: document.getElementById('nodeId').value,
                        hidden : hide})
  }*/

  /*
   * Function to hide an individual node on the graph
   */
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

  /*
   * Function to hide an individual edge from the graph
   */
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

  /*
   * Function to hide all relationships whose type match a checkbox
   */
  $scope.hideType = function(label) {
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

  /*
   * Function to get first node with a given label
   */
  $scope.getFirstNodeWithLabel = function(label) {
    var nodes = $scope.nodes.get({
      filter: function (node) {
        return (node.label == label)
      }
    })
    return nodes[0]
  }

  /*
   * Function to get first edge with a given label
   */
  $scope.getFirstEdgeWithLabel = function(label) {
    var edges = $scope.edges.get({
      filter: function (edge) {
        return (edge.label == label)
      }
    })
    return edges[0]
  }

}])
