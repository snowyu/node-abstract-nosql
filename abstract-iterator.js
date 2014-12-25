try {
  module.exports = require('nosql-stream/lib/abstract-iterator');
} catch(e) {
  console.error("type `npm install nosql-stream` to enable the feature.")
  throw e
}

