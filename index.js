const db = require('./db');

/**
 * Post a single sample
 * @param event
 * @param context
 * @param callback
 */
module.exports.postSample = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const principalId = event.requestContext.authorizer.principalId;
  const body = JSON.parse(event.body);

  console.log(JSON.stringify(body, null, 3));

  db.putSample(principalId, body.data)
    .then(() => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify('OK'),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        }
      });
    })
    .catch(err => {
      console.log(err);
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify('ERR'),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        }
      });
    });
};
