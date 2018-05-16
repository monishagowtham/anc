const neo4j = require('neo4j-driver').v1;
var driver;
const connectionURI = `bolt://${process.env.DBUSER || 'neo4j'}@${process.env.DBURI || 'localhost'}:${process.env.DBPORT || '7687'}`;
var session;

console.log(connectionURI)

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
