const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const neo4j = require('./neo4j')

const PORT = process.env.PORT || 8005

/****************************************************************************
 **** HELPER FUNCTIONS ******************************************************
 ****************************************************************************/

/*
 * Forces type to match format used in database
 */
function safeType(type) {
  // Make sure type is even a string. If not, return "Person".
  if (type == undefined || !(typeof type === "string" || type instanceof String)) {
    return "Person"
  }

  // Remove non alphabetical letters and force lowercase
  type = type.toLowerCase().replace(/[^a-z]/gi, '')

  // Capitalize string
  type = type.charAt(0).toUpperCase() + type.slice(1)

  // Shorten string if it's long, make it Person if it's empty
  if (type.length > 10) {
    type = type.slice(0,10)
  } else if (type.length == 0) {
    type = "Person"
  }
  return type
}

/*
 * Forces id to be an integer
 */
function safeId(id) {
  // If it's not a number, set id to 0
  if (id = undefined || isNaN(id)) {
    id = 0
  } else if (!Number.isInteger(id)) {
    // if it's not an integer, force it to be one
    id = Math.round(id)
  }
  return id
}

/****************************************************************************
**** API CALLS **************************************************************
****************************************************************************/

neo4j.createConnection('neo4j', '12345', function(session) {
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept");
   next();
 })

  app.get('/api/graphNodes', function (req, res) {
    var graphId = safeId(req.query.graphId)
    var records = []
    session.run("MATCH (g:Graph {graphId: {graphId} })-[:contains]->(n) RETURN distinct n LIMIT 10000",{graphId: graphId})
    .subscribe({
      onNext: function (record) {
        var rec = {
          type: record._fields[0].labels[0],
          properties: record._fields[0].properties
        }
        if (rec.properties.visId != null) {
          rec.properties.visId = rec.properties.visId.low
          records.push(rec)
        }
      },
      onCompleted: function () {
        //session.close()
        //console.log('Record is: ', records)
        res.send(JSON.stringify({ neoRecords: records}))
      },
      onError: function (error) {
        console.log(error)
        res.send(JSON.stringify({result: "error", message: "Database failed to respond to request"}))
      }
    })
  })

  app.get('/api/nodes', function (req, res) {
    var records = []
    session.run("MATCH (n1) RETURN n1 LIMIT 10000")
    .subscribe({
      onNext: function (record) {
        var rec = {
          type: record._fields[0].labels[0],
          properties: record._fields[0].properties
        }
        if (rec.properties.visId != null) {
          rec.properties.visId = rec.properties.visId.low
          records.push(rec)
        }
      },
      onCompleted: function () {
        //session.close()
        //console.log('Record is: ', records)
        res.send(JSON.stringify({ neoRecords: records}))
      },
      onError: function (error) {
        console.log(error)
      }
    })
  })

  app.get('/api/relationships', function (req, res) {
    var records = []
    session.run("MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 10000")
    .subscribe({
      onNext: function (record) {
        var rec = {
          type: record._fields[0].type,
          properties: record._fields[0].properties,
          to: record._fields[1].properties.visId.low,
          from: record._fields[2].properties.visId.low
        }
        records.push(rec)
      },
      onCompleted: function () {
        //session.close()
        //console.log('Record is: ', records)
        res.send(JSON.stringify({ neoRecords: records}))
      },
      onError: function (error) {
        console.log(error)
      }
    })
  })

  app.get('/api/graphAroundNode', function (req,res) {
    var params = {
      id: safeId(req.query.id),
      graph: safeId(req.query.graphId)
    }
    var records = []
    session.run("MATCH (a:Person {visId: {id} })<-[:contains]-(g:Graph {graphId: {graph} })-[:contains]->(n1)-[r]->(n2) WHERE (n1)-[*0..3]-(a) RETURN distinct r, n1, n2", params)
    .subscribe({
      onNext: function (record) {
        var rec = {
          type: record._fields[0].type,
          properties: record._fields[0].properties,
          to: record._fields[1].properties.visId.low,
          from: record._fields[2].properties.visId.low
        }
        records.push(rec)
      },
      onCompleted: function () {
        //session.close()
        res.status(200)
        res.send(JSON.stringify({ neoRecords: records}))
      },
      onError: function (error) {
        console.log(error)
        res.status(500)
        res.send(JSON.stringify({result: "error", message: "Database failed to respond to request"}))
      }
    })
  })

  app.post("/api/addNode", function (req, res) {
    var name = req.params.name // force to conform
    var type = safeType(req.params.type)
    var graphId = safeId(graphId)
    var ids = []
    var id = 0
    session.run("MATCH (g:Graph {graphId: {graphId} })-[:contains]-(b) RETURN distinct b.visId",{graphId: graphId})
    .subscribe({
      onNext: function (record) {
        ids.push(record._fields[0].low)
      },
      onCompleted: function () {
        for (i = 0; i < ids.length + 1 && id == 0; i++) {
          if (!ids.includes(i)) {
            id = i
          }
        }
        session.run(`MATCH (g:Graph {graphId: {graphId} }) CREATE (g)-[:contains]->(a:${type} {visId: {id} })`,{graphId: graphId, name: name, id: id})
        .subscribe({
          onNext: function (record) {

          },
          onCompleted: function () {
            res.send(JSON.stringify({id: id}))
          },
          onError: function (error) {
            console.log(error)
            res.sendStatus(500)
            res.send(JSON.stringify({result: "error", message: "Failed to add node"}))
          }
        })
      },
      onError: function (error) {
        console.log(error)
        res.sendStatus(500)
        res.send(JSON.stringify({result: "error", message: "Failed to check for available IDs"}))
      }
    })
  })

  app.post('/api/closeDB', function(req, res) {
    res.set('Content-Type', 'application/json')
    if(req.body.message == 'R U ROBOT?') {
      driver.close()
      return res.send(JSON.stringify({message: 'Went inside if'}))
    }
    return res.send(JSON.stringify({message: 'Didnt go in if'}))
  })

  app.listen(PORT, function() {
    console.log('Listening on port: ', PORT)
  })
})
