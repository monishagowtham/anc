/**
 * Controller for the vis.js graph
 * Written by Austin Barrett, Max Meyer, and Kyle Sturmer
 */

angular.module('rtApp')
        .controller('GraphController', function ($scope,$http,$routeParams,Login,Express,Title) {


  //Check if user is logged in
  $scope.loginObject = Login
  $scope.loginObject.checkSession()
  $scope.confirmMessage = "Are you sure you want to do this?"
  $scope.selectedNode = {id: 0, name: "", type: ""}
  $scope.selectedEdge = {id: 0, from: 0, to: 0, pretty: ""}
  $scope.confirmAction = "OK"
  $scope.confirmLevel = 1 // 0 - blue; 1 - green ; 2 - yellow ; 3 - red ; invalid - grey
  $scope.confirmColor = function () {
    switch($scope.confirmLevel) {
      case 0: return "btn-success"
      case 1: return "btn-primary"
      case 2: return "btn-warning"
      case 3: return "btn-danger"
      default: return "btn-secondary"
    }
  }

  $scope.graphId = $routeParams.graph || 0
  $scope.homeId = $routeParams.node || 0 // should do some get request to check what the default node should be. NOTE: 0 may not even exist if it's deleted
  $scope.graphAuthor = $routeParams.user || $scope.loginObject.username || 'sample'
  $scope.loginObject.loginMessage = ""
  $scope.nodeTypes = [
    "Person",
    "Tribe",
    "Event",
    "Document"
  ]
  $scope.nodeSelected = false
  $scope.onlyEdgeSelected = false
  $scope.inPreview = false
  $scope.editView = 0
  $scope.setEditView = (view) => {
    $scope.editView = view
  }

  // Get access to edit page title
  $scope.titleService = Title

  // set the page title
  var request = Express.requestFactory("getGraphName")
  .addParameter("u",$scope.graphAuthor)
  .addParameter("graphId",$scope.graphId)
  $http.get(request.build())
  .then(
    function onSuccess(response) {
      if (response.status == 200) {
        console.log(response)
        $scope.titleService.setTitle(response.data.name)
      } else {
        onError(response)
      }
    },
    function onError(response) {
      console.log(response)
    }
  )


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

  $scope.nodes = new vis.DataSet([])
  $scope.edges = new vis.DataSet([])
  $scope.filterRelationships = []
  $scope.allNodes = []
  var edgeId = 0

  /* Function to get node info */
  function setNodeInfo (id) {
    var request = Express.requestFactory('relationshipsByNode')
      .addParameter('graphId',$scope.graphId)
      .addParameter('u',$scope.graphAuthor)
      .addParameter('id',id)
    $http({
            method : "GET",
            url : request.build()
    })
    .then(function onSuccess(response) {
      var html = ""
      html += `<h5>${response.data.name}</h5>`
      html += `<p class="wrap">${response.data.desc}</p><hr/>`
      if (response.data.from.length > 0) {
        html += `<h6>${response.data.name.slice(0,15)}'s Relationships:</h6>`
      }
      response.data.from.forEach(function(record){
        var prettyName = (record.prettyName == undefined ?
                         record.type : record.prettyName)
        html += `<p>has ${prettyName} ${record.to}</p>`
      })
      if (response.data.to.length > 0 && response.data.from.length > 0) {
        html += '<hr />'
      }
      if (response.data.to.length > 0) {
        html += `<h6>Relationships featuring ${response.data.name.slice(0,15)}:</h6>`
      }
      response.data.to.forEach(function(record){
        var prettyName = (record.prettyName == undefined ?
                         record.type : record.prettyName)
        html += `<p>${prettyName} of/by ${record.from}</p>`
      })
      var output = document.createElement('div')
      output.innerhtml = html.trim()
      output.classList.add('node-info-box')
      $scope.nodes.update({id: id, title: html})
    },
    function onError(response) {
        console.log("Failed to retrieve Node info from database")
    })
  }


  /*
   * Get all nodes for this graph from the Express API and add them to
   * $scope.nodes to be used in the graph
   */
  function generateNodesList() {
    var request = Express.requestFactory('graphNodes')
      .addParameter("graphId",$scope.graphId)
      .addParameter("u",$scope.graphAuthor)
    $http({
        method : "GET",
        url : request.build()
    })
    .then(function onSuccess(response) {
      $scope.nodes.clear()
      $scope.allNodes = []
      response.data.forEach(function(record){
        var color = {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        }
        switch(record.type){
          case "Person":
            color.r = 250
            color.g = 225
            color.b = 125
            break;
          case "Tribe":
            color.r = 225
            color.g = 125
            color.b = 125
            break;
          case "Document":
            color.r = 250
            color.g = 150
            color.b = 70
            break;
          case "Event":
            color.r = 170
            color.g = 200
            color.b = 255
            break;
          default:
            color.r = 225
            color.g = 225
            color.b = 125
            break;
        }
        var colors = {
          background: rgba(color.r,color.g,color.b,color.a),
          border: rgba(color.r * .75,color.g * .75,color.b * .75,color.a),
          highlight: {
            background: rgba(color.r * .75,color.g * .75,color.b * .75,color.a),
            border: rgba(color.r * .5625,color.g * .5625,color.b * .5625,color.a)
          }
        }
        if ($scope.nodes.get(record.properties.visId) == undefined){
          $scope.nodes.add([{id: record.properties.visId,
          label: record.properties.name, color: colors, title: "Loading info", hidden: true}])

          var localNode = {name: record.properties.name, id: record.properties.visId, rels: 0, type: record.type}
          $scope.allNodes.push(localNode)
          getNumberRelationships(localNode)
        }

      })
      $scope.generateRelationshipList()
    },
    function onError(response) {
        console.log("Failed to retrieve nodes from database")
    })
   }

   /*
    * reset all nodes to be hidden
    */
  function hideAllNodes() {
    $scope.allNodes.forEach((node) => {
      $scope.nodes.update({id: node.id, hidden: true})
    })
  }

  /*
   * Get all relationships for this graph from the Express API and add them to
   * $scope.relationships to be used in graph
   */
  $scope.generateRelationshipList = function() {
     var request = Express.requestFactory("graphAroundNode")
       .addParameter("graphId",$scope.graphId)
       .addParameter("u",$scope.graphAuthor)
       .addParameter("id",$scope.homeId)
     $http({
            method : "GET",
            url : request.build()
       })
       .then(function onSuccess(response) {
         $scope.inPreview = false
         hideAllNodes()
         $scope.edges.clear()
         edgeId = 0
         filterRelationships = []
         $scope.nodes.update({id: $scope.homeId, hidden: false})
         response.data.forEach(function(record){
           var newLabel = (record.properties.prettyName == undefined ?
                            record.type : record.properties.prettyName)
           // Check if edge exists in opposite direction
           var edges = $scope.edges.get({
             filter: function (edge) {
               return (edge.label == newLabel && edge.from == record.to
                       && edge.to == record.from)
             }
           })
           if (edges.length == 0) {

             // If it doesn't exist the other way, add it
             $scope.edges.add([{id: edgeId, from: record.from, to: record.to,
                               label: newLabel, arrows: 'to', hidden: false}])

             // Make node visible since it will appear on the graph
             $scope.nodes.update({id: record.from, hidden: false})
             $scope.nodes.update({id: record.to, hidden: false})

             // Loop through relationships and push to filterRelationships
             var typeNew = true
             $scope.filterRelationships.forEach((filterRel) => {
               if (filterRel === newLabel) {
                 typeNew = false
               }
             })
             if (typeNew) {
               $scope.filterRelationships.push(newLabel)
             }

           } else {
             // If it does exist, make the arrow bidirectional
             edges.forEach((edge)=> {
               $scope.edges.update({id: edge.id, arrows:'to, from'})
             })
           }

           // increment edgeId so all edge ids are unique
           edgeId ++
         })
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
         setTimeout($scope.jiggleToggle,1000)
         setTimeout( () => {
           $scope.allNodes.forEach( (node) => {
             setNodeInfo(node.id)
           })}, 1000)

         $scope.network.on('click', function(properties) {
           $scope.nodeSelected = false
           $scope.onlyEdgeSelected = false

           var nodes = properties.nodes
           var edges = properties.edges
           if (nodes.length > 0) {
             $scope.nodeSelected = true
             var id = nodes[0]
             $scope.selectedNode.id = id
             $scope.allNodes.forEach((node)=>{
               if (id == node.id) {
                 $scope.selectedNode.name = node.name
                 $scope.selectedNode.type = node.type
               }
             })
           } else if (edges.length > 0) {
             $scope.onlyEdgeSelected = true
             var id = edges[0]
             var edge = $scope.edges.get(id)
             $scope.selectedEdge.id = id
             $scope.selectedEdge.from = edge.from
             $scope.selectedEdge.to = edge.to
             $scope.selectedEdge.pretty = edge.label
           }
           $scope.$apply()
         })
       },
       function onError(response) {
           console.log("Failed to retrieve relationships from database")
       })
   }

   function getNumberRelationships(node) {
     var request = Express.requestFactory("numberRelationships")
       .addParameter("graphId",$scope.graphId)
       .addParameter("u",$scope.graphAuthor)
       .addParameter("id",node.id)
     $http({
         method : "GET",
         url : request.build()
     })
     .then(function onSuccess(response) {
       node.rels=response.data.count
     },
     function onError(response) {
         console.log("Failed to retrieve number of relationships to node")
     })
   }

   /*
    * Sets homeId to default Id per graph
    */
    function setDefaultHomeId() {
      //TODO: Add API call to get default node by graph ID and set homeId to it.
    }

  // Page setup
  generateNodesList()

  /***************************************************************************
   * Helper Functions
   ***************************************************************************/


  /*
   * Function to reinitialize graph
   */
   function reinitializeGraph() {
     $scope.network.setData({nodes: $scope.nodes, edges: $scope.edges})
     $scope.network.redraw()
   }
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
   * Function to get node by id
   */
  $scope.getNodeById = function(id) {
    return $scope.nodes.get(id)
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

  /*
   * Update graph around node by id
   */
   $scope.moveTo = function(id) {
      $scope.homeId = id
      hideAllNodes()
      $scope.generateRelationshipList()
   }

   /*
    * Switch graphs (setDefaultHomeId not yet implemented)
    */
    $scope.switchGraphs = function(graphId) {
      $scope.graphId = graphId
      setDefaultHomeId()
      generateNodesList()
    }

    /*
     * Create Node
     */
    $scope.createNode = function(name,type,desc) {
      var request = Express.requestFactory("addNode")
      $http.post(
              request.build(),
              JSON.stringify({
                "graphId": $scope.graphId,
                "u": $scope.graphAuthor,
                "name": name,
                "type": type,
                "desc": desc,
                "key": $scope.loginObject.key
              })
      )
      .then(function onSuccess(response) {
          generateNodesList()
      },
      function onError(response) {
          console.log(response)
          $scope.loginObject.logout()
      })
    }

    $scope.confirmEditNode = function(name,type,desc) {
      var id = $scope.selectedNode.id
      var oldType = $scope.selectedNode.type
      var oldName = $scope.selectedNode.name
      $scope.confirmMessage = `Are you sure you want to edit ${oldName}?`
      $scope.confirmAction = 'Edit'
      $scope.confirmLevel = 2 //Yellow
      $('#confirmDialogButton').off('click').on('click',function(){
        editNode(id,oldType,oldName,name,type,desc)
        generateNodesList()
      })
      $('#confirmDialog').modal('show')
    }

    $scope.confirmDeleteNode = function() {
      var id = $scope.selectedNode.id
      var type = $scope.selectedNode.type
      var name = $scope.selectedNode.name
      $scope.confirmMessage = `Are you sure you want to delete ${name}?`
      $scope.confirmAction = 'Delete'
      $scope.confirmLevel = 3 //Red
      $('#confirmDialogButton').off('click').on('click',function(){
        deleteNode(id,type)
        generateNodesList()
      })
      $('#confirmDialog').modal('show')
    }

    /*
     * Edit Node
     */
    function editNode (id,type,name,newName,newType,newDesc) {
      var request = Express.requestFactory("editNode")
      $http.post(
              request.build(),
              JSON.stringify({
                "graphId": $scope.graphId,
                "u": $scope.graphAuthor,
                "id": id,
                "type": type,
                "name": name,
                "newName": newName,
                "newType": newType,
                "desc": newDesc,
                "key": $scope.loginObject.key
              })
      )
      .then(function onSuccess(response) {
          console.log(response)
          generateNodesList()
      },
      function onError(response) {
          console.log(response)
          $scope.loginObject.logout()
      })
    }

    /*
     * Delete Node
     */
    function deleteNode (id,type) {
      var request = Express.requestFactory("deleteNode")
      $http.post(
              request.build(),
              JSON.stringify({
                "graphId": $scope.graphId,
                "u": $scope.graphAuthor,
                "type": type,
                "id": id,
                "key": $scope.loginObject.key
              })
      )
      .then(function onSuccess(response) {
          generateNodesList()
      },
      function onError(response) {
          console.log(response)
          $scope.loginObject.logout()
      })
    }

    $scope.confirmEditRelationship = function(newPretty) {
      var pretty = $scope.selectedEdge.pretty
      var from = $scope.selectedEdge.from
      var to = $scope.selectedEdge.to
      $scope.confirmMessage = `Are you sure you want to edit ${pretty}?`
      $scope.confirmAction = 'Edit'
      $scope.confirmLevel = 2 //Yellow
      $('#confirmDialogButton').off('click').on('click',function(){
        editRelationship(pretty,from,to,newPretty)
      })
      $('#confirmDialog').modal('show')
    }

    $scope.confirmDeleteRelationship = function() {
      var type = $scope.selectedEdge.pretty
      var from = $scope.selectedEdge.from
      var to = $scope.selectedEdge.to
      $scope.confirmMessage = `Are you sure you want to delete the relationship ${type}?`
      $scope.confirmAction = 'Delete'
      $scope.confirmLevel = 3 //Red
      $('#confirmDialogButton').off('click').on('click',function(){
        deleteRelationship(type,from,to)
      })
      $('#confirmDialog').modal('show')
    }

    /*
     * Edit Node
     */
    function editRelationship (pretty,from,to,newPretty) {
      var request = Express.requestFactory("editRelationship")
      var newName = newPretty.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, i) {
         if (+match === 0) return ""
         return i == 0 ? match.toLowerCase() : match.toUpperCase()
       })
       var name = pretty.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, i) {
          if (+match === 0) return ""
          return i == 0 ? match.toLowerCase() : match.toUpperCase()
        })
        console.log(JSON.stringify({
          "graphId": $scope.graphId,
          "u": $scope.graphAuthor,
          "name": name,
          "from": from,
          "to": to,
          "newName": newName,
          "prettyName": newPretty,
          "key": $scope.loginObject.key
        }))
       $http.post(
               request.build(),
               JSON.stringify({
                 "graphId": $scope.graphId,
                 "u": $scope.graphAuthor,
                 "name": name,
                 "from": from,
                 "to": to,
                 "newName": newName,
                 "prettyName": newPretty,
                 "key": $scope.loginObject.key
               })
       )
       .then(function onSuccess(response) {
           $scope.generateRelationshipList()
           console.log(response)
       },
       function onError(response) {
           console.log(response)
           $scope.loginObject.logout()
       })
     }

    /*
     * Delete Node
     */
    function deleteRelationship (type,from,to) {
      var name = type.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, i) {
         if (+match === 0) return ""
         return i == 0 ? match.toLowerCase() : match.toUpperCase()
       })
      var request = Express.requestFactory("deleteRelationship")
      $http.post(
              request.build(),
              JSON.stringify({
                "graphId": $scope.graphId,
                "u": $scope.graphAuthor,
                "name": name,
                "from": from,
                "to": to,
                "key": $scope.loginObject.key
              })
      )
      .then(function onSuccess(response) {
        $scope.generateRelationshipList()
      },
      function onError(response) {
          console.log(response)
          $scope.loginObject.logout()
      })
    }

    /*
     * Create Relationship (from and to are swapped and I'm not sure why but it
     * makes sense this way)
     */
     $scope.createRelationship = function(prettyName,from,to) {
       name = prettyName.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, i) {
          if (+match === 0) return ""
          return i == 0 ? match.toLowerCase() : match.toUpperCase()
        });
        var request = Express.requestFactory("addRelationship")
        $http.post(
                request.build(),
                JSON.stringify({
                  "graphId": $scope.graphId,
                  "u": $scope.graphAuthor,
                  "name": name,
                  "key": $scope.loginObject.key,
                  "pretty": prettyName,
                  "from": from,
                  "to": to
                })
        )
        .then(function onSuccess(response) {
            $scope.generateRelationshipList()
            console.log(response)
        },
        function onError(response) {
            console.log(response)
            $scope.loginObject.logout()
        })
      }

    /*
     * Preview Relationship Locally (from and to are swapped and I'm not sure why
     * but it makes sense this way)
     */
    $scope.previewRelationship = function(prettyName,to,from) {
      $scope.inPreview = true
      var newLabel = prettyName
      // Check if edge exists in opposite direction
      var edges = $scope.edges.get({
        filter: function (edge) {
          return (edge.label == newLabel && edge.from == to
                  && edge.to == from)
        }
      })
      if (edges.length == 0) {

        // If it doesn't exist the other way, add it
        $scope.edges.add([{id: edgeId, from: from, to: to,
                          label: newLabel, arrows: 'from', color:'rgba(255,255,0,1)',
                           hidden: false}])

        // Make node visible since it will appear on the graph
        $scope.nodes.update({id: from, hidden: false})
        $scope.nodes.update({id: to, hidden: false})

        // Loop through relationships and push to filterRelationships
        var typeNew = true
        $scope.filterRelationships.forEach((filterRel) => {
          if (filterRel === newLabel) {
            typeNew = false
          }
        })
        if (typeNew) {
          $scope.filterRelationships.push(newLabel)
        }

      } else {
        // If it does exist, make the arrow bidirectional
        edges.forEach((edge)=> {
          $scope.edges.update({id: edge.id, color: 'rgba(0,255,255,1)', arrows:'to, from'})
        })
      }

      // increment edgeId so all edge ids are unique
      edgeId ++

      // re-initialize graph
      var graph = document.getElementById('graph')
      $scope.data = {
        nodes: $scope.nodes,
        edges: $scope.edges
      }
      $scope.options = { physics : { enabled: true }}
      $scope.network = new vis.Network(graph, $scope.data, $scope.options)
      setTimeout($scope.jiggleToggle,1000)
    }


})
