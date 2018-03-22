const crypto = require('crypto');
const { Sample, SampleToken } = require('./sample');

/**
 * Create a token
 * @param id
 * @param hash
 */
const createToken = (id, hash) => {
  const encrypt = crypto.createCipher('aes256', new Buffer(process.env.JWT_SECRET));
  let encrypted = encrypt.update(`XPI:${id}:${hash}`, 'utf8', 'hex');
  encrypted += encrypt.final('hex');
  return encrypted;
};

/**
 * Create a token, or retrieve existing token
 * @param db
 * @param id
 */
const createSampleToken = (db, id) => new Promise((resolve, reject) => {
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const token = createToken(id, hash);
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
