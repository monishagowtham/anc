const neo4j = require('neo4j-driver').v1;
var driver;
const connectionURI = process.env.NEO4J_URI || `bolt://neo4j@ec2-18-218-77-87.us-east-2.compute.amazonaws.com`;
var session;

module.exports = {
  createConnection: function (username, password, callback) {
    driver = neo4j.driver(connectionURI, neo4j.auth.basic(username, password));
    session = driver.session();
    return callback(session);
  },
  getDBInstance: function() {
    return driver;
  },
  getSession: function() {
    return session;
  }
};
