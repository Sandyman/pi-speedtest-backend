const graphql = require('graphql').graphql;
const root = require('./resolvers');
const schema = require('./schema');
const isEmpty = require('lodash.isempty');

/**
 * Run GraphQL server
 * @param event
 * @param ctx
 * @param done
 */
module.exports.runGraphQL = (event, ctx, done) => {
  const body = JSON.parse(event.body);

  // A query or a mutation. If neither: error.
  let query = body.query || body.mutation;
  if (!query) return done({ error: 'Could not find query nor mutation.' });

  // Remove newlines and collapse remaining whitespace
  query = query.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Variables must be a map
  const variables = body.variables && !isEmpty(body.variables)
    ? body.variables
    : {};

  console.log('Query:');
  console.log(JSON.stringify(query, null, 3));

  console.log('Variables:');
  console.log(JSON.stringify(variables, null, 3));

  console.log('Context: ');
  console.log(JSON.stringify(ctx, null, 3));

  return graphql(schema, query, root, ctx, variables)
    .then(done);
};
