const authorizer = require('./auth/graphql');
const { encode } = require('./cipher');
const db = require('./db');
const github = require('./github');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const graphql = require('./graphql');
const headers = require('./headers');

const atSecret = process.env.AT_SECRET;
const jwtSecret = process.env.JWT_SECRET;

/**
 * Create a response (convenience function)
 * @param sc
 */
const response = sc => ({
  statusCode: sc,
  body: sc.toString(),
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Authenticate user by requesting Access Token from GitHub
 * @param event
 * @param context
 * @param cb
 */
const authGitHub = (event, context, cb) => {
  console.log(JSON.stringify(event, null, 3));

  if (!event.queryStringParameters) {
    console.log('Did not get code or state. Abort.');
    return cb(null, response(401));
  }

  const { code, state } = event.queryStringParameters;
  if (!code || !state) {
    console.log('Did not get code or state. Abort.');
    return cb(null, response(401));
  }

  let accessToken;
  console.log('Getting access token...');
  return github.requestAccessToken(code, state)
    .then(body => {
      accessToken = body.access_token;
      console.log(`Get access token: ${accessToken}`);
      return github.requestUserObject(accessToken);
    })
    .then(userObject => {
      const id = userObject.id.toString();
      return db.getUser(id)
        .then(user => {
          if (user) return Promise.resolve(user);

          return db.putUser({
            id: userObject.id.toString(),
            email: userObject.email,
            username: userObject.login,
            fullname: userObject.name,
            avatarUrl: userObject.avatar_url,
          })
        })
    })
    .then(user => {
      const encrypted = encode(atSecret, `${accessToken}`);
      const item = {
        id: user.id,
        accessToken: encrypted,
      };
      return db.putAccessToken(item).then(() => user);
    })
    .then(({ id, fullname }) => {
      const claims = {
        iat: moment().unix(),
        sub: id,
        name: fullname,
      };
      const token = jwt.sign(claims, jwtSecret);
      return cb(null, {
        statusCode: 200,
        body: JSON.stringify({ token }),
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Content-Type': 'application/json'
        }
      })
    })
    .catch(e => {
      console.log(e);
      return cb(null, response(500))
    });
};

/**
 * Logout user by removing current Access Token
 * @param event
 * @param context
 * @param cb
 */
const logout = (event, context, cb) => {
  console.log(JSON.stringify(event, null, 3));

  const principalId = event.requestContext.authorizer.principalId;
  db.removeAccessToken(principalId)
    .catch(console.log)
    .then(() => cb(null, response(200)));
};

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
  authGitHub,
  authorizer,
  graphql: handler,
  logout,
};
