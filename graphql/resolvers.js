const Sample = require('./sample');

/**
 * Root resolvers
 */
const root = {
  getSamples: (args, ctx) => {
    const { db, id } = ctx;
    return db.getSamples(id)
      .then(r => r.map(v => new Sample(v)));
  },
};

module.exports = root;
