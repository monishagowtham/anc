/**
 * Defines a simple vis.js graph for testing
 * Written by Austin Barrett
 */

var nodes, edges, options;

function makeGraph() {
  nodes = new vis.DataSet([
    {id: 1, label: 'Austin'},
    {id: 2, label: 'Max'},
    {id: 3, label: 'Kyle'},
    {id: 4, label: 'Perogative'}
  ])

  edges = new vis.DataSet([
    {from: 1, to: 2, label: 'inGroupwith', arrows: 'to, from'},
    {from: 2, to: 3, label: 'inGroupwith', arrows: 'to, from'},
    {from: 3, to: 1, label: 'inGroupwith', arrows: 'to, from'},
    {from: 4, to: 3, label: 'is his', arrows: 'to'}
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
