const crypto = require('crypto');

if (!process.env.JWT_SECRET) {
  console.log('Environment variable JWT_SECRET with secret key is required');
}

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
 * Authorise based on incoming token
 * @param event
 * @param context
 * @param callback
 */
const authoriser = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const authToken = event.authorizationToken;

  if (event.type.toUpperCase() !== 'TOKEN') return callback('Authorisation not of type TOKEN');
  if (!authToken) return callback('No Authorization header');
  if (!authToken.startsWith('Bearer')) return callback('Invalid authorization header');

  const token = authToken.replace(/^Bearer\s*/i, '');

  const decrypt = crypto.createDecipher('aes256', new Buffer(process.env.JWT_SECRET));
  let decrypted = decrypt.update(token, 'hex', 'utf8');
  decrypted += decrypt.final();

  // XPI:<sub>:<hash>
  const ar = decrypted.split(':');
  console.log(ar);
  if (ar[0] !== 'XPI') return callback('Invalid token received');

  const authResponse = {
    principalId: ar[1],
    context: {
      hashKey: ar[2]
    },
    policyDocument: policy,
  };
  return callback(null, authResponse);
};

/**
 * Authoriser
 * @param event
 * @param context
 * @param callback
 */
module.exports = authoriser;
