const AWS = require('aws-sdk');
const moment = require('moment');

const dbClient = new AWS.DynamoDB.DocumentClient();

const SAMPLE_TABLE = process.env.SAMPLE_TABLE;

/**
 * Get samples from database
 * @param id
 */
const getSamples = id => new Promise((resolve, reject) => {
  const params = {
    TableName: SAMPLE_TABLE,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.query(params, function(err, data) {
    if (err) return reject(err);

    return resolve(data.Items);
  });
});

/**
 * Put sample in database
 * @param id
 * @param sample
 */
const putSample = (id, sample) => new Promise((resolve, reject) => {
  const created = moment();
  const timestamp = created.toISOString();
  const params = {
    TableName: SAMPLE_TABLE,
    Item: {
      id,
      created: created.unix().toString(),
      expires: created.add(30, 'days').unix(),
      sample,
      timestamp,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.put(params, err => {
    if (err) return reject(err);

    return resolve();
  });
});

module.exports = {
  getSamples,
  putSample,
};
