const authorizer = require('./auth/graphql');
const db = require('./db');

const graphql = require('./graphql');
const headers = require('./headers');

/**
 * Handler for graphql endpoint
 * @param event
 * @param context
 * @param callback
 */
const handler = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const principalId = event.requestContext.authorizer.principalId;

  // Create context to pass to graphql server
  const ctx = {
    db,
    id: principalId,
  };

  graphql.runGraphQL(event, ctx, result => callback(null, {
    statusCode: 200,
    body: JSON.stringify(result),
    headers,
  }));
};

module.exports = {
  authorizer,
  graphql: handler,
};
