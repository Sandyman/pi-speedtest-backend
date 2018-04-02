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
  
  type Stat {
    min: Float!
    max: Float!
    mean: Float!
    var: Float!
    std: Float!
  }
  
  type Stats {
    download: Stat
    upload: Stat
    ping: Stat
  }
  
  type Token {
    token: String!
  }
  
  type UserInfo {
    id: String!
    avatarUrl: String
    email: String!
    fullname: String
    username: String
  }
  
  type Query {
    getLastSample: Sample
    getSamples: [Sample]
    getStats: Stats
    getToken: Token
    me: UserInfo
  }
  
  type Mutation {
    createToken: Token!
  }
`);

module.exports = schema;
