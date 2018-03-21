const _ = require('underscore');
const Sample = require('./sample');

/**
 * Root resolvers
 */
const root = {
  getSamples: (obj, args, context) => {
    const { db, id } = context;
    return db.getSamples(id)
      .then(r => _.map(r, v => new Sample(v)));
  }
};

module.exports = root;
