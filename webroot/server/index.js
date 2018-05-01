const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const neo4j = require('./neo4j')

const PORT = process.env.PORT || 8005

neo4j.createConnection('neo4j', '12345', function(session) {
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept");
   next();
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
        records.push(rec)
      },
      onCompleted: function () {
        //session.close()
        console.log('Record is: ', records)
        res.send(JSON.stringify({ neoRecords: records}))
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
          to: record._fields[1].properties.id.low,
          from: record._fields[2].properties.id.low
        }
        records.push(rec)
      },
      onCompleted: function () {
        //session.close()
        console.log('Record is: ', records)
        res.send(JSON.stringify({ neoRecords: records}))
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
