const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const env = require('dotenv').config({path: `${path.dirname(require.main.filename)}/.env`})
const api = require('./api')
const express = require('express')
console.log(process.env.PORT)

const app = express()
const PORT = process.env.PORT || 8000
const SEND_FILE_OPTIONS = {
  root: path.dirname(require.main.filename)
}

app.use('/api', api)

app.get('/views/*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  res.sendFile('app' + req.originalUrl, SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + req.originalUrl.slice(1))
      res.status(404).end()
    }
  })
})

app.get('/scripts/:script*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  if (path.extname(req.originalUrl).includes("map")) {
    res.status(415).end()
    return
  }
  var url = 'app' + req.originalUrl
  if (req.params.script === 'dep') {
    //console.log("dep " + path.basename(req.originalUrl))
    var urlMap = {
      "bootstrap" : "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "jquery" : "node_modules/jquery/dist/jquery.min.js",
      "popper" : "node_modules/popper.js/dist/umd/popper.min.js",
      "angular" : "node_modules/angular/angular.js",
      "angular-route" : "node_modules/angular-route/angular-route.js",
      "vis" : "node_modules/vis/dist/vis.min.js"
    }
    url = urlMap[path.basename(req.originalUrl)]
  }
  //console.log(`Reading ${req.originalUrl} as /${url}`)

  res.sendFile(url, SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + url)
      res.status(404).end()
    }
  })
})

app.get('/styles/:style*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  var url = 'app' + req.originalUrl
  if (req.params.style === 'dep') {
    var urlMap = {
      "bootstrap" : "node_modules/bootstrap/dist/css/bootstrap.css",
      "bootstrap.css.map" : "node_modules/bootstrap/dist/css/bootstrap.css.map",
      "vis" : "node_modules/vis/dist/vis.css"
    }
    url = urlMap[path.basename(req.originalUrl)]
  }
  //console.log(`Reading ${req.originalUrl} as /${url}`)

  res.sendFile(url, SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + url)
      res.status(404).end()
    }
  })
})

app.get('/favicon.ico', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)

  res.sendFile("app" + req.originalUrl, SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + url)
      res.status(404).end()
    }
  })
})

app.get('/assets/*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  res.sendFile(req.originalUrl.slice(1), SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + url)
      res.status(404).end()
    }
  })
})

// Define any additional routes before the next one

app.get('/*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  //console.log('\n\n\n')
  res.sendFile("app/template.html", SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + req.originalUrl.slice(1))
      res.status(404).end()
    }
  })
})

if (process.env.PROTOCOL === 'https') {
  var server = https.createServer({
    key: fs.readFileSync(process.env.CERTKEY || './certificate.pem'),
    cert: fs.readFileSync(process.env.CERT || './privatekey.pem')
  }, app)
  http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
} else {
  var server = http.createServer(app)
}
server.listen(PORT, function() {
  console.log('Listening on port: ', PORT)
})
