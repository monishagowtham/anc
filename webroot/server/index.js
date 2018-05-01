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
  if (id == undefined || isNaN(id)) {
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
    session.run(`MATCH (g:Graph {graphId: ${graphId}})-[:contains]->(n) RETURN distinct n LIMIT 10000`)
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
        res.send(JSON.stringify(records))
      },
      onError: function (error) {
        console.log(error)
      }
    })
  })

  app.get('/api/relationshipsByNode', function (req, res) {
    var graphId = safeId(req.query.graphId)
    var visId = safeId(req.query.id)
    var fromRecords = []
    var toRecords = []
    var name = "<name>"
    session.run(`MATCH (s {visId: ${visId}}) RETURN s LIMIT 1`)
    .subscribe({
      onNext: function (record) {
        name = record._fields[0].properties.name
      },
      onCompleted: function () {
        session.run(`MATCH (s {visId: ${visId}})-[r]->(n)<-[:contains]-(g:Graph {graphId: ${graphId}}) RETURN distinct r,n LIMIT 10000`)
        .subscribe({
          onNext: function (record) {
            var rec = {
              type: record._fields[0].type,
              to: record._fields[1].properties.name
            }
            fromRecords.push(rec)
          },
          onCompleted: function () {

            session.run(`MATCH (s {visId: ${visId}})<-[r]-(n)<-[:contains]-(g:Graph {graphId: ${graphId}}) RETURN distinct r,n LIMIT 10000`)
            .subscribe({
              onNext: function (record) {
                var rec = {
                  type: record._fields[0].type,
                  from: record._fields[1].properties.name
                }
                if (record._fields[1].labels[0] !== 'Graph') {
                  toRecords.push(rec)
                }
              },
              onCompleted: function () {
                res.send(JSON.stringify({name: name, from: fromRecords, to: toRecords}))
              },
              onError: function (error) {
                console.log(error)
              }
            })
          },
          onError: function (error) {
            console.log(error)
          }
        })
      },
      onError: function (error) {
        console.log(error)
      }
    })
  })

  app.get('/api/nodes', function (req, res) {
    var records = []
    session.run('MATCH (n1) RETURN n1 LIMIT 10000')
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
        res.send(JSON.stringify(records))
      },
      onError: function (error) {
        console.log(error)
      }
    })
  })

  app.get('/api/relationships', function (req, res) {
    var records = []
    session.run('MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 10000')
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
        res.send(JSON.stringify(records))
      },
      onError: function (error) {
        console.log(error)
      }
    })
  })

  app.get('/api/graphAroundNode', function (req,res) {
    var id = safeId(req.query.id)
    var graphId = safeId(req.query.graphId)
    var records = []
    session.run(`MATCH (a {visId: ${id}})<-[:contains]-(g:Graph {graphId: ${graphId}})-[:contains]->(n1)-[r]->(n2) WHERE (n1)-[*0..3]-(a) RETURN distinct r, n1, n2`)
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
        res.send(JSON.stringify(records))
      },
      onError: function (error) {
        console.log(error)
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
