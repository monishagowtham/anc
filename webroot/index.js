const http = require('http')
const path = require('path')

const app = require('./server')
const PORT = process.env.RTREE_PORT || 8000
const SEND_FILE_OPTIONS = {
  root: './'
}

app.get('/views/*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  res.sendFile(req.originalUrl.slice(1), SEND_FILE_OPTIONS, (err) => {
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
  var url = req.originalUrl.slice(1)
  if (req.params.script === 'dep') {
    //console.log("dep " + path.basename(req.originalUrl))
    var urlMap = {
      "bootstrap" : "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "jquery" : "node_modules/jquery/dist/jquery.min.js",
      "popper" : "node_modules/popper.js/dist/umd/popper.min.js",
      "angular" : "node_modules/angular/angular.js",
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
  if (path.extname(req.originalUrl).includes("map")) {
    res.status(415).end()
    return
  }
  var url = req.originalUrl.slice(1)
  if (req.params.style === 'dep') {
    var urlMap = {
      "bootstrap" : "node_modules/bootstrap/dist/css/bootstrap.css",
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

// Define any additional routes before the next one

app.get('/*', (req,res) => {
  //console.log(`Attempting to read ${req.originalUrl}`)
  //console.log('\n\n\n')
  res.sendFile("index.html", SEND_FILE_OPTIONS, (err) => {
    if (err) {
      console.log("OOPS " + req.originalUrl.slice(1))
      res.status(404).end()
    }
  })
})

app.listen(PORT, function() {
  console.log('Listening on port: ', PORT)
})
