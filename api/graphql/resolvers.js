const { encode, hash } = require('../cipher');
const { Sample, SampleToken } = require('./sample');
const { Stats } = require('./stats');
const { UserInfo } = require('./user');

/**
 * Create a token, or retrieve existing token
 * @param db
 * @param id
 */
const createSampleToken = async (db, id) => {
  const hashKey = hash();
  const token = encode(process.env.JWT_SECRET, `XPI:${id}:${hashKey}`);
  await db.putSampleToken(id, token, hashKey);
  return token;
};

/**
 * Create token
 * @param args
 * @param ctx
 */
const createToken = async (args, ctx) => {
  const { db, id } = ctx;
  const token = await createSampleToken(db, id);
  return new SampleToken(token);
};

/**
 * Get last sample (i.e., most recent)
 * @param args
 * @param ctx
 */
const getLastSample = async (args, ctx) => {
  const { db, id } = ctx;
  const sample = await db.getLastSample(id);
  return sample ? new Sample(sample) : null;
};

/**
 * Get all samples
 */
const getSamples = async (args, ctx) => {
  const { db, id } = ctx;
  const samples = await db.getSamples(id);
  return samples.map(s => new Sample(s));
};

/**
 * Get statistics
 * @param args
 * @param ctx
 */
const getStats = async (args, ctx) => {
  const samples = await getSamples(args, ctx);
  return new Stats(samples);
};

/**
 * Get token
 * @param args
 * @param ctx
 */
const getToken = async (args, ctx) => {
  const { db, id } = ctx;
  const token = await db.getSampleToken(id);
  return token ? new SampleToken(token) : null;
};

/**
 * Get user info
 * @param args
 * @param ctx
 */
const getUserInfo = async (args, ctx) => {
  const { db, id } = ctx;
  const user = await db.getUser(id);
  return new UserInfo(user);
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
  me: getUserInfo,
};
