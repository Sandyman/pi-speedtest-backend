const jwt = require('jsonwebtoken');
const db = require('../db');
const { decode } = require('../cipher');
const github = require('../github');

if (!process.env.GQL_SECRET) {
  console.log('Environment variable GQL_SECRET with secret key is required');
}

const secret = new Buffer(process.env.GQL_SECRET);
const region = process.env.REGION || '*';
const apiId = process.env.API_ID || '*';
const stageId = process.env.STAGE_ID || '*';
const method = process.env.METHOD || '*';
const path = process.env.URL_PATH || '*';

const policy = {
  Version: '2012-10-17',
  Statement: {
    Action: 'execute-api:Invoke',
    Effect: 'Allow',
    Resource: `arn:aws:execute-api:${region}:*:${apiId}/${stageId}/${method}/${path}`,
  },
};

/**
 * Authorise graphql request
 * @param event
 * @param context
 * @param callback
 */
const authoriser = async (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const authToken = event.authorizationToken;

  if (event.type.toUpperCase() !== 'TOKEN') return callback('Authorisation not of type TOKEN');
  if (!authToken) return callback('No Authorization header');
  if (!authToken.startsWith('Bearer')) return callback('Invalid authorization header');

  try {
    const token = authToken.replace(/^Bearer\s*/i, '');
    const payload = await jwt.verify(token, secret);
    const id = payload.sub;
    const accessToken = await db.getAccessToken(id);
    if (!accessToken) return callback('No access token found');

    const decodedToken = decode(process.env.AT_SECRET, accessToken.accessToken);
    try {
      await github.requestUserObject(decodedToken);
      return callback(null, { principalId: id, policyDocument: policy });
    } catch (err) {
      return callback('Not logged into GitHub');
    }
  } catch (err) {
    return callback(err);
  }
};

/**
 * Authoriser
 * @param event
 * @param context
 * @param callback
 */
module.exports = authoriser;
