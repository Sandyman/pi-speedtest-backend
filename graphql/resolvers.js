const { encode, hash } = require('../cipher');
const { Sample, SampleToken } = require('./sample');

/**
 * Create a token, or retrieve existing token
 * @param db
 * @param id
 */
const createSampleToken = (db, id) => new Promise((resolve, reject) => {
  const hashKey = hash();
  const token = encode(process.env.JWT_SECRET, `XPI:${id}:${hashKey}`);
  return db.putSampleToken(id, token, hashKey).then(() => resolve({ token }));
});

/**
 * Root resolvers
 */
const root = {
  createToken: (args, ctx) => {
    const { db, id } = ctx;

    return createSampleToken(db, id).then(t => new SampleToken(t));
  },

  getLastSample: (args, ctx) => {
    const { db, id } = ctx;
    return db.getLastSample(id).then(t => t ? new Sample(t) : null);
  },

  getSamples: (args, ctx) => {
    const { db, id } = ctx;
    return db.getSamples(id).then(r => r.map(v => new Sample(v)));
  },

  getToken: (args, ctx) => {
    const { db, id } = ctx;

    return db.getSampleToken(id).then(t => t ? new SampleToken(t) : null);
  },
};

module.exports = root;
