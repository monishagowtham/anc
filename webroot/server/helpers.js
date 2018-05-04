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
    // Make sure type is even a string. If not, return "Person".
    if (name == undefined || !(typeof name === "string" || name instanceof String)) {
      return "Unnamed"
    }

    // Remove non alphabetical letters and force lowercase
    name = name.replace(/[^a-zA-Z\s]/gi, '')

    // Shorten string if it's long, make it Person if it's empty
    if (name.length > 100) {
      name = name.slice(0,100)
    } else if (name.length == 0) {
      name = "Unnamed"
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
