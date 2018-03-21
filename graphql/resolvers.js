const getSamplesById =  require('../db').getSamples;
const Sample = require('./sample');

/**
 * Root resolvers
 */
const root = {
  getSamples: (args, ctx) => {
    const { id } = ctx;
    return getSamplesById(id)
      .then(r => r.map(v => new Sample(v)));
  },
};

module.exports = root;
