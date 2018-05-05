const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const neo4j = require('./neo4j')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')
const helpers = require('./helpers')

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

 /*
  * Check api key
  */
 function validateApiKey(user, apiKey, callback, reject, error) {
   var cutoff = Math.floor(new Date() / 1000) - 200000
   var found = false
   session.run("MATCH (u:User {userId: {user}})-[:apiKey]->(k:ApiKey {key: {key}}) return k.stamp", {user: user, key: apiKey})
     .subscribe({
       onNext: function (record) {
         if (cutoff <= record._fields[0]) {
           found = true
         }
       },
       onCompleted: function () {
         session.run("MATCH (u:User {userId: {user}})-[:apiKey]->(k:ApiKey) WHERE k.stamp <= {then} DETACH DELETE k", {user: user, then: cutoff })
         if (found) {
           callback()
         } else {
           reject()
         }
       },
       onError: function (error) {
         error(error)
       }
     })
 }

 app.get('/api/config', (req, res) => {
   res.set('Content-Type', 'application/JSON')
   res.send(JSON.stringify({
     protocol: process.env.RTREE_PROTOCOL || "http",
     domain: process.env.RTREE_DOMAIN || "localhost",
     port:process.env.RTREE_PORT || 8000
   }))
 })

 app.get('/api/status', (req, res) => {
   res.set('Content-Type', 'application/JSON')
   session.run("MATCH (n) RETURN count(n)")
    .subscribe({
      onNext: () => {},
      onCompleted: () => {
        res.send(JSON.stringify({
          website: "online",
          database: "online"
        }))
      },
      onError: () => {
        res.send(JSON.stringify({
          website: "online",
          database: "offline"
        }))
      }
    })

 })

  app.get('/api/graphNodes', function (req, res) {
    var username = helpers.safeUserName(req.query.u)
    var graphId = helpers.safeGraphId(req.query.graphId)
    var records = []
    session.run("MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId} })-[:contains]->(n) RETURN distinct n LIMIT 10000",{graphId: graphId, username: username})
    .subscribe({
      onNext: function (record) {
        var rec = {
          type: record._fields[0].labels[0],
          properties: record._fields[0].properties
        }
        if (rec.properties.visId != null) {
          rec.properties.visId = (rec.properties.visId.low == undefined ? rec.properties.visId : rec.properties.visId.low)
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

   app.get('/api/numberRelationships', function (req, res) {
     var username = helpers.safeUserName(req.query.u)
     var records = {count: 0}
     var parameters = {
       username: username,
       graphId: helpers.safeGraphId(req.query.graphId),
       id: helpers.safeId(req.query.id)
     }
     session.run('MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->({visId: {id}})-[r]-(b) WHERE NOT b:Graph RETURN count(r) as count', parameters)
     .subscribe({
       onNext: function (record) {
         records.count = (record._fields[0].low == undefined ? record._fields[0] : record._fields[0].low)
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
    var username = helpers.safeUserName(req.query.u)
    var parameters = {
      graphId: helpers.safeGraphId(req.query.graphId),
      visId: helpers.safeId(req.query.id),
      username: username
    }
    var fromRecords = []
    var toRecords = []
    var name = "<name>"
    session.run('MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(s {visId: {visId}}) RETURN s LIMIT 1', parameters)
    .subscribe({
      onNext: function (record) {
        name = record._fields[0].properties.name
      },
      onCompleted: function () {
        session.run('MATCH (s {visId: {visId}})-[r]->(n)<-[:contains]-(g:Graph {graphId: {graphId}})<-[:ownsGraph]-(u:User {userId: {username}}) RETURN distinct r,n LIMIT 10000', parameters)
        .subscribe({
          onNext: function (record) {
            var rec = {
              prettyName: record._fields[0].properties.prettyName,
              type: record._fields[0].type,
              to: record._fields[1].properties.name
            }
            fromRecords.push(rec)
          },
          onCompleted: function () {

            session.run('MATCH (s {visId: {visId}})<-[r]-(n)<-[:contains]-(g:Graph {graphId: {graphId}})<-[:ownsGraph]-(u:User {userId: {username}}) RETURN distinct r,n LIMIT 10000', parameters)
            .subscribe({
              onNext: function (record) {
                var rec = {
                  prettyName: record._fields[0].properties.prettyName,
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
        res.send(JSON.stringify({result: "error", message: "Database failed to respond to request"}))
      }
    })
  })

  app.get('/api/graphAroundNode', function (req,res) {
    var username = helpers.safeUserName(req.query.u)
    var params = {
      id: helpers.safeId(req.query.id),
      graphId: helpers.safeGraphId(req.query.graphId),
      username: username

    }
    var records = []
    session.run(`MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(n1 {visId: {id}})-[r]->(n2) WHERE NOT n2:Graph RETURN r, n1, n2 UNION MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(n2 {visId: {id}})<-[r]-(n1) WHERE NOT n1:Graph RETURN r, n1, n2 UNION MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(a {visId: {id}})-[]-(n1)-[r]->(n2) WHERE NOT n2:Graph AND NOT n1:Graph RETURN r, n1, n2 UNION MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(a {visId: {id}})-[]-(n2)<-[r]-(n1) WHERE NOT n2:Graph AND NOT n1:Graph RETURN r, n1, n2 UNION MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(a {visId: {id}})-[]-(b)-[]-(n1)-[r]->(n2) WHERE NOT n2:Graph AND NOT n1:Graph AND NOT b:Graph RETURN r, n1, n2 UNION MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(a {visId: {id}})-[]-(b)-[]-(n2)<-[r]-(n1) WHERE NOT n2:Graph AND NOT n1:Graph AND NOT b:Graph RETURN r, n1, n2`, params)
    .subscribe({
      onNext: function (record) {
        var rec = {
          type: record._fields[0].type,
          properties: record._fields[0].properties,
          to: (record._fields[1].properties.visId.low == undefined ? record._fields[1].properties.visId : record._fields[1].properties.visId.low),
          from: (record._fields[2].properties.visId.low == undefined ? record._fields[2].properties.visId : record._fields[2].properties.visId.low)
        }
        records.push(rec)
      },
      onCompleted: function () {
        //session.close()
        res.send(JSON.stringify(records))
      },
      onError: function (error) {
        console.log(error)
        res.send(JSON.stringify({result: "error", message: "Database failed to respond to request"}))
      }
    })
  })

  app.get('/api/listGraphs', function (req,res) {
    var username = helpers.safeUserName(req.query.u)
    var params = {
      username: username
    }
    var records = []
    session.run(`MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph) RETURN g`, params)
    .subscribe({
      onNext: function (record) {
        var graph = {
          id: record._fields[0].properties.graphId,
          name: record._fields[0].properties.name
        }
        records.push(graph)
      },
      onCompleted: function () {
        //session.close()
        res.send(JSON.stringify(records))
      },
      onError: function (error) {
        console.log(error)
        res.send(JSON.stringify({result: "error", message: "Database failed to respond to request"}))
      }
    })
  })

  app.post('/api/requestApiKey', function (req,res) {
    var params = {
      user: req.body.u,
      key: uuid(),
      stamp: Math.floor(new Date() / 1000)
    }
    if (params.user === "INVALID USERNAME") {
      console.log(error)
      res.sendStatus(403)
      return
    }
    session.run('MATCH (u:User {userId: {user}})-[:password]->(p) RETURN p.pwd',params)
    .subscribe({
      onNext: function (record) {
        bcrypt.compare(req.body.p,record._fields[0], (err, result) => {
          if (err) {
            console.log(err)
            res.sendStatus(403)
          } else {
            if (!result) {
              res.sendStatus(403)
            } else {
              session.run('MATCH (u:User {userId: {user}}) CREATE (u)-[:apiKey]->(:ApiKey {key: {key}, stamp: {stamp}})',params)
              .subscribe({
                onNext: function (record) {
                },
                onCompleted: function () {
                  //session.close()
                  res.send(JSON.stringify({key: params.key}))
                },
                onError: function (error) {
                  console.log(error)
                  res.sendStatus(403)
                }
              })
            }
          }
        })
      },
      onCompleted: function () {
        //session.close()
      },
      onError: function (error) {
        console.log(error)

        res.sendStatus(403)
      }
    })
  })

  app.post("/api/logOutEverywhere", function (req, res) {
    var username = helpers.safeUserName(req.body.u)
    var count = 0
    validateApiKey(username, req.body.key, () => {
      session.run("MATCH (u:User {userId: {username}})-[:apiKey]->(k:ApiKey) DETACH DELETE k RETURN count(k) as count",{username: username})
      .subscribe({
        onNext: function (record) {
          count = (record._fields[0].low != undefined ? record._fields[0].low : record._fields[0])
        },
        onCompleted: function () {
          res.status(200).send(JSON.stringify({result: "success", keysRemoved: count}))
        },
        onError: function (error) {
          console.log(error)
          res.send(JSON.stringify({result: "error", message: "Failed to check for available IDs"}))
        }
      })
    }, () => {
      res.sendStatus(403)
    }, (error) => {
      res.send(JSON.stringify({result: "error", message: "Failed to verify API key"}))
    })

  })

  app.post("/api/newGraph", function (req, res) {
    var username = helpers.safeUserName(req.body.u)
    validateApiKey(username, req.body.key, () => {
      var name = helpers.safeName(req.body.name)
      var graphId = helpers.safeGraphId(name)
      var exists = false
      var resultId = ""
      session.run("MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}}) Return g",{graphId: graphId, username: username})
      .subscribe({
        onNext: function (record) {
          exists = true
          console.log("ERROR")
        },
        onCompleted: function () {
          if (exists) {
            res.status(400).send(JSON.stringify({result: "error", message: "Graph name too similar to existing graph"}))
            return
          } else {
            session.run(`MATCH (u:User {userId: {username}}) CREATE (u)-[:ownsGraph]->(g:Graph {graphId: {graphId}, name:{name}}) RETURN g.graphId`,{graphId: graphId, name: name, username: username})
            .subscribe({
              onNext: function (record) {
                resultId = record._fields[0]
              },
              onCompleted: function () {
                if (resultId != "") {
                  res.status(200).send(JSON.stringify({result: "success", graphId: resultId}))
                }
              },
              onError: function (error) {
                console.log(error)
                res.status(500).send(JSON.stringify({result: "error", message: "Failed to add graph"}))
              }
            })
          }

        },
        onError: function (error) {
          console.log(error)
          res.status(500).send(JSON.stringify({result: "error", message: "Failed to check for conflicting graphs"}))
        }
      })
    }, () => {
      res.status(403).send(JSON.stringify({result: "error", message: "Authentication Failed. Please log back in."}))
    }, (error) => {
      res.status(500).send(JSON.stringify({result: "error", message: "Failed to verify API key"}))
    })

  })

  app.post("/api/addNode", function (req, res) {
    var username = helpers.safeUserName(req.body.u)
    validateApiKey(username, req.body.key, () => {
      var name = helpers.safeName(req.body.name)
      var type = helpers.safeType(req.body.type)
      var graphId = helpers.safeGraphId(req.body.graphId)
      var ids = []
      var id = 0
      session.run("MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId}})-[:contains]->(b) RETURN distinct b.visId",{graphId: graphId, username: username})
      .subscribe({
        onNext: function (record) {
          ids.push(record._fields[0].low == undefined ? record._fields[0] : record._fields[0].low)
        },
        onCompleted: function () {
          for (i = 0; i < ids.length + 1 && id == 0; i++) {
            if (!ids.includes(i)) {
              id = i
            }
          }
          session.run(`MATCH (u:User {userId: {username}})-[:ownsGraph]->(g:Graph {graphId: {graphId} }) CREATE (g)-[:contains]->(a:${type} {visId: {id}, name: {name}})`,{username: username, graphId: graphId, name: name, id: id})
          .subscribe({
            onNext: function (record) {
            },
            onCompleted: function () {
              res.send(JSON.stringify({id: id}))
            },
            onError: function (error) {
              console.log(error)
              res.send(JSON.stringify({result: "error", message: "Failed to add node"}))
            }
          })
        },
        onError: function (error) {
          console.log(error)
          res.send(JSON.stringify({result: "error", message: "Failed to check for available IDs"}))
        }
      })
    }, () => {
      res.sendStatus(403)
    }, (error) => {
      res.send(JSON.stringify({result: "error", message: "Failed to verify API key"}))
    })

  })

  app.post("/api/addRelationship", function (req, res) {
    var username = helpers.safeUserName(req.body.u)
    validateApiKey(username, req.body.key, () => {
      var name = helpers.safeName(req.body.name)
      var params = {
        prettyName: helpers.safeName(req.body.pretty),
        graphId: helpers.safeGraphId(req.body.graphId),
        from: helpers.safeId(req.body.from),
        to: helpers.safeId(req.body.to),
        username: username
      }
      session.run(`MATCH (a {visId: {from}})<-[:contains]-(g:Graph {graphId: {graphId} })<-[:ownsGraph]-(u:User {userId: {username}}), (g)-[:contains]->(b {visId: {to}}) MERGE (a)-[:${name} {prettyName: {prettyName}}]->(b)`,params)
      .subscribe({
        onNext: function (record) {
        },
        onCompleted: function () {
          res.send(JSON.stringify({result: "success"}))
        },
        onError: function (error) {
          console.log(error)
          res.send(JSON.stringify({result: "error", message: "Failed to add Relationship"}))
        }
      })
    }, () => {
      res.sendStatus(403)
    }, (error) => {
      res.send(JSON.stringify({result: "error", message: "Failed to verify API key"}))
    })
  })

  app.post("/api/registerUser", function (req, res) {
    var params = {
      name: helpers.safeName(req.body.name),
      username: helpers.safeUserName(req.body.u),
      hash: undefined
    }
    if (params.username === "INVALID USERNAME") {
      res.send(JSON.stringify({result: "error", message: "Invalid username"}))
      return
    }
    var exists = false
    session.run("MATCH (u:User {userId: {username}}) RETURN u",params)
    .subscribe({
      onNext: function (record) {
        res.status(500)
        res.send(JSON.stringify({result: "error", message: "User already exists"}))
      },
      onCompleted: function () {
        if (!exists) {
          bcrypt.hash(req.body.p,10,(err, hash) => {
            if (err) {
              console.log(err)
            } else {
              params.hash = hash
              session.run("CREATE (h:HashedPassword {userId: {username}, pwd: {hash}})<-[:password]-(u:User {userId: {username}, name: {name}})-[:ownsGraph]->(g:Graph {graphId: 0})-[:contains]->(p:Person {visId: 0, name: \"Example McExamplton\"})<-[:homeOf]-(g)",params)
              .subscribe({
                onNext: function (record) {
                },
                onCompleted: function () {
                  res.status(200)
                  res.send(JSON.stringify({username: params.username}))
                },
                onError: function (error) {
                  console.log(error)
                  res.status(500)
                  res.send(JSON.stringify({result: "error", message: "Failed to add Relationship"}))
                }
              })
            }
          })

        }
      },
      onError: function (error) {
        console.log(error)
        res.status(500)
        res.send(JSON.stringify({result: "error", message: "Failed to add user"}))
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

  module.exports = app
})
