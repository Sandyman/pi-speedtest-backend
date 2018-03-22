const crypto = require('crypto');
const { Sample, SampleToken } = require('./sample');

/**
 * Create a token
 * @param id
 */
const createToken = id => {
  const encrypt = crypto.createCipher('aes256', new Buffer(process.env.JWT_SECRET));
  let encrypted = encrypt.update(`XPI:${id}`, 'utf8', 'hex');
  encrypted += encrypt.final('hex');
  return encrypted;
};

/**
 * Create a token, or retrieve existing token
 * @param db
 * @param id
 */
const createSampleToken = (db, id) => new Promise((resolve, reject) => db.getSampleToken(id)
  .then(t => {
    console.log(JSON.stringify(t, null, 3));
    if (t) return resolve({ token: t.token, status: 'EXISTING' });

    console.log('New token:');
    const token = createToken(id);
    console.log(token);
    return db.putSampleToken(id, token)
      .then(s => resolve({ token: s.token, status: 'NEW' }));
  }));

/**
 * Root resolvers
 */
const root = {
  getSamples: (args, ctx) => {
    const { db, id } = ctx;
    return db.getSamples(id)
      .then(r => r.map(v => new Sample(v)));
  },

  getToken: (args, ctx) => {
    const { db, id } = ctx;

    return db.getSampleToken(id)
      .then(t => t ? new SampleToken(t) : null);
  },

  createToken: (args, ctx) => {
    const { db, id } = ctx;

    return createSampleToken(db, id)
      .then(t => new SampleToken(t));
  },
};

module.exports = root;
