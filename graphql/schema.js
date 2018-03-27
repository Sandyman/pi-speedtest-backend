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
  
  type Token {
    token: String!
  }
  
  type Query {
    getLastSample: Sample
    getSamples: [Sample]
    getToken: Token
  }
  
  type Mutation {
    createToken: Token!
  }
`);

module.exports = schema;
