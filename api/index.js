const AWS = require('aws-sdk');
const authorizer = require('./auth/graphql');
const { encode } = require('./cipher');
const db = require('./db');
const github = require('./github');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const sns = new AWS.SNS();

const graphql = require('./graphql');
const headers = require('./headers');

const atSecret = process.env.AT_SECRET;
const gqlSecret = process.env.GQL_SECRET;

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
const authGitHub = async (event, context, cb) => {
  console.log(JSON.stringify(event, null, 3));

  if (!event.queryStringParameters) {
    console.log('Did not get code or state. Abort.');
    return cb(null, response(401));
  }

  const { code, state } = event.queryStringParameters;
  if (!code || !state || code === 'undefined' || state === 'undefined') {
    console.log('Did not get code or state. Abort.');
    return cb(null, response(401));
  }

  console.log('Getting access token...');

  try {
    const body = await github.requestAccessToken(code, state);
    const accessToken = body.access_token;
    const userObject = await github.requestUserObject(accessToken);
    const id = userObject.id.toString();
    let user = await db.getUser(id);
    if (!user) {
      user = await db.putUser({
        id: userObject.id.toString(),
        email: userObject.email,
        username: userObject.login,
        fullname: userObject.name,
        avatarUrl: userObject.avatar_url,
      })
    }
    const encrypted = encode(atSecret, `${accessToken}`);
    const item = {
      id: user.id,
      accessToken: encrypted,
    };
    await db.putAccessToken(item);
    const claims = {
      iat: moment().unix(),
      sub: user.id,
      name: user.fullname,
    };
    const token = jwt.sign(claims, gqlSecret);
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
  } catch (err) {
    console.log(err);
    return cb(null, response(500));
  }
};

/**
 * Delete user account
 * @param event
 * @param context
 * @param cb
 */
const deleteUser = (event, context, cb) => {
  console.log(JSON.stringify(event, null, 3));

  const principalId = event.requestContext.authorizer.principalId;
  const { sub } = event.pathParameters;
  if (sub !== principalId) {
    return cb(null, {
      statusCode: 403,
      body: JSON.stringify('403 Forbidden'),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json',
      }
    })
  }

  const params = {
    Message: JSON.stringify({ sub }),
    Subject: `Delete account for user ${sub}`,
    TopicArn: process.env.CLEANUP_TOPIC_ARN,
  };
  console.log(JSON.stringify(params, null, 3));
  sns.publish(params, (err, data) => {
    if (err) console.log(err);

    return cb(null, {
      statusCode: 202,
      body: JSON.stringify('202 Accepted'),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json',
      }
    })
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
    .then(() => cb(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json'
      }
    })
  );
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
  deleteUser,
  graphql: handler,
  logout,
};
