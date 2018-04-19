const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const neo4j = require('./neo4j');

const PORT = process.env.PORT || 8005;

neo4j.createConnection('neo4j', '12345', function(session) {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/api/hello', function(req, res){
    res.set('Content-Type', 'application/json');
    return res.send(JSON.stringify({message: 'hello, world'}));
  });

  app.get('/api/everything', function(req, res){
    var records = [];
    session.run('MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25')
    .subscribe({
    onNext: function (record) {
      records.push(record.get('r'));
    },
    onCompleted: function () {
      //session.close();
      console.log('Record is: ', records);
      res.send(JSON.stringify({message: "Done Kyle, I'm done", neoRecords: records}));
    },
    onError: function (error) {
      console.log(error);
    }
  });
  });

  app.post('/api/closeDB', function(req, res) {
    res.set('Content-Type', 'application/json');
    if(req.body.message == 'R U ROBOT?') {
      driver.close();
      return res.send(JSON.stringify({message: 'Went inside if'}));
    }
    return res.send(JSON.stringify({message: 'Didnt go in if'}));
  });

  app.listen(PORT, function() {
    console.log('Listening on port: ', PORT);
  });
});
