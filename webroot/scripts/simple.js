/**
 * Defines a simple vis.js graph for testing
 * Written by Austin Barrett
 */

var nodes, edges, options;

function makeGraph() {
  nodes = new vis.DataSet([
    {id: 1, label: 'Alice'},
    {id: 2, label: 'Bob'},
    {id: 3, label: 'Charlie'},
    {id: 4, label: 'David'},
    {id: 5, label: 'Eve'}
  ])

  edges = new vis.DataSet([
    {from: 1, to: 2, label: 'mother', arrows: 'from'},
    {from: 2, to: 1, label: 'son', arrows: 'from'},
    {from: 1, to: 4, label: 'mother', arrows: 'from'},
    {from: 4, to: 1, label: 'son', arrows: 'from'},
    {from: 2, to: 4, label: 'brother', arrows:'to,from'},
    {from: 4, to: 5, label: 'beneficiary', arrows: 'to'},
    {from: 4, to: 5, label: 'business partner', arrows: 'to, from'},
    {from: 2, to: 5, label: 'friend', arrows: 'to, from'},
    {from: 1, to: 3, label: 'acquantaince', arrows: 'to, from'}
  ])

  var graph = document.getElementById('graph')
  var data = {
    nodes: nodes,
    edges: edges
  }
  options = {}
  var network = new vis.Network(graph, data, options)
}

function removeNode() {
  nodes.remove({id: document.getElementById('nodeId').value})
}
