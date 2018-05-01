/**
 * Controller for the vis.js graph
 * Written by Austin Barrett, Max Meyer, and Kyle Sturmer
 */

angular.module('rtApp')
        .controller('GraphController',['$scope','$http', ($scope,$http) => {

  /*
   * Helper function for creating nodes. Converts rgba values to string.
   */
  function rgba(r, g, b, a) {
    r = Math.round(r)
    g = Math.round(g)
    b = Math.round(b)

    if (r < 0) {
      r = 0
    } else if (r > 255) {
      r = 255
    }
    if (g < 0) {
      g = 0
    } else if (g > 255) {
      g = 255
    }
    if (b < 0) {
      b = 0
    } else if (b > 255) {
      b = 255
    }
    if (a < 0) {
      a = 0
    } else if (a > 1) {
      a = 1
    }

    return `rgba(${r},${g},${b},${a})`
  }

  /* Function for Physics Toggle Button */
  $scope.jiggleToggle = function() {
    $scope.options.physics.enabled = !$scope.options.physics.enabled
    $scope.network.setOptions($scope.options)
  }

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
      var color = {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      }
      switch(record.type){
        case "Person":
          color.r = 250
          color.g = 175
          color.b = 175
          break;
        case "Tribe":
          color.r = 225
          color.g = 225
          color.b = 125
          break;
        default:
          color.r = 125
          color.g = 125
          color.b = 250
          break;
      }
      var colorObj = {
        background: rgba(color.r,color.g,color.b,color.a),
        border: rgba(color.r * .75,color.g * .75,color.b * .75,color.a),
        highlight: {
          background: rgba(color.r * .75,color.g * .75,color.b * .75,color.a),
          border: rgba(color.r * .5625,color.g * .5625,color.b * .5625,color.a)
        }
      }
      $scope.nodes.add([{id: record.properties.id.low,
        label: record.properties.name, color: colorObj, hidden: false}])
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
      // Check if edge exists in opposite direction
      var edges = $scope.edges.get({
        filter: function (edge) {
          return (edge.label == record.type && edge.from == record.to
                  && edge.to == record.from)
        }
      })
      if (edges.length == 0) {
        // If it doesn't exist the other way, add it
        $scope.edges.add([{id: edgeId, from: record.from, to: record.to,
                          label: record.type, arrows: 'from', hidden: false}])
      } else {
        // If it does exist, make the arrow bidirectional
        edges.forEach((edge)=> {
          $scope.edges.update({id: edge.id, arrows:'to, from'})
        })
      }

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
  $scope.options = { physics : { enabled: true }}
  $scope.network = new vis.Network(graph, $scope.data, $scope.options)

  // Page setup
  setTimeout($scope.jiggleToggle,1000)


  /***************************************************************************
   * Helper Functions
   ***************************************************************************/

  /*
   * Function to a remove a node from the graph
   */
  $scope.removeNode = function() {
    $scope.nodes.remove({id: document.getElementById('nodeId').value})
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
    var nodes = $scope.nodes.get({
      filter: function (node) {
        return (node.label == label)
      }
    })
    nodes.forEach(function(node){
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

  /*
   * Function to get number of edges with a given label
   */
  $scope.getNumberOfEdgesWithLabel = function(label) {
    var edges = $scope.edges.get({
      filter: function (edge) {
        return (edge.label == label)
      }
    })
    return edges.length
  }

}])
