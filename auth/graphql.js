const authoriser = require('./authoriser');

if (!process.env.GQL_SECRET) {
  console.log('Environment variable JWT_SECRET with secret key is required');
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
 * Authoriser
 * @param event
 * @param context
 * @param callback
 */
module.exports = authoriser(secret, policy);
