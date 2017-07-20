const _ = require('lodash')

module.exports = {
  isNEString: (v) => { return _.isString(v) && v.length > 0 },
  isNEArray: (v) => { return _.isArray(v) && v.length > 0 }
}
