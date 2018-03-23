const { encode, hash } = require('../cipher');
const { Sample, SampleToken } = require('./sample');

/**
 * Create a token, or retrieve existing token
 * @param db
 * @param id
 */
const createSampleToken = (db, id) => new Promise((resolve, reject) => {
  const token = encode(process.env.JWT_SECRET, `XPI:${id}:${hash()}`);
  return db.putSampleToken(id, token, hash).then(() => resolve({ token }));
});

/**
 * Root resolvers
 */
const root = {
  getSamples: (args, ctx) => {
    const { db, id } = ctx;
    return db.getSamples(id).then(r => r.map(v => new Sample(v)));
  },

  getToken: (args, ctx) => {
    const { db, id } = ctx;

    return db.getSampleToken(id).then(t => t ? new SampleToken(t) : null);
  },

  createToken: (args, ctx) => {
    const { db, id } = ctx;

    return createSampleToken(db, id).then(t => new SampleToken(t));
  },
};

module.exports = root;
