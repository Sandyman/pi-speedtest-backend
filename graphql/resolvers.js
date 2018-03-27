const { encode, hash } = require('../cipher');
const { Sample, SampleToken } = require('./sample');
const { Stats } = require('./stats');

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
 * Create token
 * @param args
 * @param ctx
 */
const createToken = (args, ctx) => {
  const { db, id } = ctx;

  return createSampleToken(db, id).then(t => new SampleToken(t));
};

/**
 * Get last sample (i.e., most recent)
 * @param args
 * @param ctx
 */
const getLastSample = (args, ctx) => {
  const { db, id } = ctx;
  return db.getLastSample(id).then(t => t ? new Sample(t) : null);
};

/**
 * Get all samples
 */
const getSamples = (args, ctx) => {
  const { db, id } = ctx;
  return db.getSamples(id).then(r => r.map(v => new Sample(v)));
};

/**
 * Get statistics
 * @param args
 * @param ctx
 */
const getStats = (args, ctx) => getSamples(args, ctx).then(r => new Stats(r));

/**
 * Get token
 * @param args
 * @param ctx
 */
const getToken = (args, ctx) => {
  const { db, id } = ctx;

  return db.getSampleToken(id).then(t => t ? new SampleToken(t) : null);
};

/**
 * Root resolvers
 */
module.exports = {
  createToken,
  getLastSample,
  getSamples,
  getStats,
  getToken,
};
