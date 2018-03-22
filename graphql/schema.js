const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Sample {
    timestamp: String!
    upload: Float!
    download: Float!
    ping: Float!
    isp: String!
    location: String!
    country: String!
    cc: String!
  }
  
  type Query {
    getSamples: [Sample]
  }
`);

module.exports = schema;
