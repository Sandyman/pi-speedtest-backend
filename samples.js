const authorizer = require('./auth/samples');
const db = require('./db');
const headers = require('./headers');

/**
 * Post a single sample
 * @param event
 * @param context
 * @param callback
 */
const postSample = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const principalId = event.requestContext.authorizer.principalId;
  const body = JSON.parse(event.body);

  console.log(JSON.stringify(body, null, 3));

  db.putSample(principalId, body.data)
    .then(() => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify('OK'),
        headers,
      });
    })
    .catch(err => {
      console.log(err);
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify('ERR'),
        headers,
      });
    });
};

module.exports = {
  authorizer,
  postSample,
};
