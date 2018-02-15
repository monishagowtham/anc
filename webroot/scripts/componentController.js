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

angular.module('spaghettiApp',[]).controller('ComponentController', ['$scope', '$sce', function ($scope, $sce) {
  var mainNavObject = new Menu()
    .add(new MenuItem("Home", "/"))
	//.add(new MenuItem("Next item", "/location")) // keep adding more like this

  $scope.mainNav = $sce.trustAsHtml(mainNavObject.toHtmlAsString())
  $scope.footer = $sce.trustAsHtml("<footer class='container'><p class='float-right'><a href='#'>Back to top</a></p><p>&copy; 2018 Somebody &middot; <a href='https://www.youtube.com/watch?v=7YvAYIJSSZY'>Privacy</a></p></footer>")
}])