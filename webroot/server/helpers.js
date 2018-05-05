module.exports = {
  /****************************************************************************
   **** HELPER FUNCTIONS ******************************************************
   ****************************************************************************/

  /*
   * Forces type to match format used in database
   */
  safeType: (type) => {
    // Make sure type is even a string. If not, return "Person".
    if (type == undefined || !(typeof type === "string" || type instanceof String)) {
      return "Person"
    }

    // Remove non alphabetical letters and force lowercase
    type = type.toLowerCase().replace(/[^a-z]/gi, '')

    // Capitalize string
    type = type.charAt(0).toUpperCase() + type.slice(1)

    // Shorten string if it's long, make it Person if it's empty
    if (type.length > 10) {
      type = type.slice(0,10)
    } else if (type.length == 0) {
      type = "Person"
    }
    return type
  },

  /*
   * Forces name to match format safe for database
   */
  safeName: (name) => {
    // Make sure type is even a string. If not, return "Unnamed".
    if (name == undefined || !(typeof name === "string"
      || name instanceof String || name.length == 0)) {
      return "Unnamed"
    }

    // Shorten string if it's long
    if (name.length > 100) {
      name = name.slice(0,100)
    }
    return name
  },

  /*
   * Forces username to match format safe for database
   */
  safeUserName: (username) => {
    // Make sure type is even a string. If not, return "Person".
    if (username == undefined || !(typeof username === "string" || username instanceof String)) {
      return "INVALID USERNAME"
    }

    // Remove non alphabetical letters and force lowercase
    username = username.toLowerCase().replace(/[^a-z]/gi, '')

    // Shorten string if it's long, make it Person if it's empty
    if (username.length > 64) {
      username = username.slice(0,64)
    } else if (username.length == 0) {
      username = "INVALID USERNAME"
    }
    return username
  },

  /*
   * Forces username to match format safe for database
   */
  safeGraphId: (graphId) => {
    // Make sure type is even a string. If not, fix it.
    if (graphId === undefined) {
      graphId = 0
    }

    // Remove non alphabetical letters, force lowercase, and turn spaces to -
    graphId = graphId.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9_-\s]/gi, '_').replace(/\s/gi, '-')

    // Shorten string if it's long, make it Person if it's empty
    if (graphId.length > 64) {
      graphId = graphId.slice(0,64)
    } else if (graphId.length == 0) {
      graphId = "0"
    }
    return graphId
  },

  /*
   * Forces id to be an integer
   */
  safeId: (id) => {
    // If it's not a number, set id to 0
    if (id == undefined || isNaN(id)) {
      id = 0
    } else if (!Number.isInteger(id)) {
      // if it's not an integer, force it to be one
      id = Math.round(id)
    }
    return id
  }
}
