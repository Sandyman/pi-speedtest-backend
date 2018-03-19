const AWS = require('aws-sdk');
const moment = require('moment');

const dbClient = new AWS.DynamoDB.DocumentClient();

const SAMPLE_TABLE = process.env.SAMPLE_TABLE;

/**
 * Put sample in database
 * @param id
 * @param sample
 */
const putSample = (id, sample) => new Promise((resolve, reject) => {
  const created = moment();
  const expires = created.add(30, 'days');
  const params = {
    TableName: SAMPLE_TABLE,
    Item: {
      id,
      created: created.unix().toString(),
      expires: expires.unix(),
      sample,
    }
  };
  dbClient.put(params, err => {
    if (err) return reject(err);

    return resolve();
  });
});

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

  putSample(principalId, body.data)
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
