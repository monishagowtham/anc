rtApp.factory('Title', function() {
  var object = {
    title: "RelationshipTree",
    appTitle: " - RelationshipTree",
    setTitle: function(subTitle) {
      object.title = subTitle + object.appTitle
    }
  }
  return object
})
