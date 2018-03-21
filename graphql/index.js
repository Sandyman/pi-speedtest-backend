const graphql = require('graphql').graphql;
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

  // Remove newlines and collapse remaining whitespace
  const query = body.query.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Variables must be a map
  const variables = body.variables && !isEmpty(body.variables)
    ? body.variables
    : {};

  console.log(JSON.stringify(query, null, 3));

  console.log(JSON.stringify(variables, null, 3));

  return graphql(schema, query, null, ctx, variables).then(done);
};
