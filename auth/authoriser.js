const jwt = require('jsonwebtoken');

/**
 *
 * @param secret
 * @param policy
 */
module.exports = (secret, policy) => (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const authToken = event.authorizationToken;

  if (event.type.toUpperCase() !== 'TOKEN') return callback('Authorisation not of type TOKEN');
  if (!authToken) return callback('No Authorization header');
  if (!authToken.startsWith('Bearer')) return callback('Invalid authorization header');

  const token = authToken.replace(/^Bearer\s*/i, '');
  return jwt.verify(token, secret, (err, payload) => {
    if (!err && payload) {
      return callback(null, { principalId: payload.sub, policyDocument: policy });
    }
    return callback(err);
  });
};
