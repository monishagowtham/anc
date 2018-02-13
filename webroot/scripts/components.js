/**
 * Defines reusable components to be used throughout website
 * Written by Austin Barrett
 */

// Note: This class contains some left-over code relating to sub-menus, which
// I decided not to finish implementing because I didn't want to use them, but
// I left the remaining code here because it's not horribly obtrusive and
// will come in handy later if I decide to use that kind of menu item.

// returns true if the partialUrl matches the current Url
function isCurrentPage(partialUrl) {
  var fullUrl = (' '+ window.location).slice(1)
  var endOfUrl = fullUrl.replace(/http:\/\/([a-z]*[A-Z]*[0-9]*\.*)*/g,'')
  var noOptions = endOfUrl.replace(/\?.*/g,'')
  if (noOptions == partialUrl || noOptions + '.html' == partialUrl ||
  noOptions + 'index.html' == partialUrl || noOptions + '/index.html'== partialUrl ||
  noOptions == partialUrl + '.html' || noOptions == partialUrl + 'index.html' ||
  noOptions == partialUrl + '/index.html') {
    return true
  }
  return false
}

class MenuItem {
  constructor(text,url,sublist) {
    this.text = text
    this.url = url
    this.sublist = sublist
  }

  toHtmlAsString(isSub) {
    if (isSub === undefined) {
      isSub = false;
    }
    var subHtml = ''
    var classes = 'nav-item'
    if (isSub) {
    classes = 'dropdown-item'
    }
    if (isCurrentPage(this.url)) {
      classes += ' active'
    }
    if (this.sublist != undefined) {
      subHtml = this.sublist.toHtmlAsString(true);
      classes += ' expandable'
    }
    return `<li class="${classes}"><a class='nav-link' href='${this.url}'>${this.text}</a>${subHtml}</li>`
  }

}

class Menu {
  constructor() { this.items = [] }

  // chainable
  add(item) {
    this.items.push(item)
    return this
  }

  // returns string of html representation
  toHtmlAsString(isSub) {
    if (isSub === undefined) {
      isSub = false;
    }
    var lis = ''
    var classes = 'navbar-nav mr-auto'
    if (isSub) {
      classes = ' dropdown-menu'
    }
    this.items.forEach(function(item) {
      lis += item.toHtmlAsString(isSub)
    })
    return `<ul class="${classes}">${lis}</ul>`
  }

}

  static listToHtmlString(projects, id) {
    var size = projects.length
    if (size < 1) {
      return '<p>No Carousel Items Provided</p>'
      console.log('Error: No Carousel Items Provided')
    }
    var html = `<div id='${id}' class='carousel slide' data-ride='carousel'>`
    html += "<ol class='carousel-indicators'>"
    html += `<li data-target='#${id}' data-slide-to='0' class='active'></li>`
    for (var i = 1; i < size; i++) {
      html += `<li data-target='#${id}' data-slide-to='${i}'></li>`
    }
    html += "</ol><div class='carousel-inner'>"
    var active = true
    projects.forEach(function(project) {
      html += project.toHtmlAsString(active)
      active = false
    })
    html += '</div>'
    html += `<a class="carousel-control-prev" href="#${id}" role="button" data-slide="prev">`
    html += `<span class="carousel-control-prev-icon" aria-hidden="true"></span>`
    html +=  '<span class="sr-only">Previous</span>'
    html += `<a class="carousel-control-next" href="#${id}" role="button" data-slide="next">`
    html += `<span class="carousel-control-next-icon" aria-hidden="true"></span>`
    html +=  '<span class="sr-only">Next</span>'
    html += '</div>'
    return html
  }
}


angular.module('spaghettiApp',[]).controller('ComponentController', ['$scope', '$sce', function ($scope, $sce) {
  var mainNavObject = new Menu()
    .add(new MenuItem("Home", "/"))
	//.add(new MenuItem("Next item", "/location")) // keep adding more like this

  var projects = [
    new Project('Ancestry','/Projects/ancestry','/media/images/projects/ancestry.png','A school project I&#39;m using as filler for some reason','Find out more'),
    new Project('Big Red Button','https://www.amazon.com/Big-Dome-Push-Button-Red/dp/B00CYGTH9I','/media/images/projects/button.jpg','A big red button. I don&#39;t have one of these.','Buy one'),
    new Project('Fancy Keyboard','https://www.amazon.com/CORSAIR-RAPIDFIRE-Mechanical-Gaming-Keyboard/dp/B01D8H09TS','/media/images/projects/esport.jpg','I have a nice keyboard.','Buy one'),
  ]

  $scope.mainNav = $sce.trustAsHtml(mainNavObject.toHtmlAsString())
  $scope.footer = $sce.trustAsHtml("<footer class='container'><p class='float-right'><a href='#'>Back to top</a></p><p>&copy; 2018 Somebody &middot; <a href='https://www.youtube.com/watch?v=7YvAYIJSSZY'>Privacy</a></p></footer>")
}])
