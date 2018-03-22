const AWS = require('aws-sdk');
const moment = require('moment');

const dbClient = new AWS.DynamoDB.DocumentClient();

const SAMPLE_TABLE = process.env.SAMPLE_TABLE;
const SAMPLE_TOKEN_TABLE = process.env.SAMPLE_TOKEN_TABLE;

/**
 * Get sample token
 * @param id
 */
const getSampleToken = id => new Promise((resolve, reject) => {
  console.log('getSampleToken()');
  const params = {
    TableName: SAMPLE_TOKEN_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.get(params, function(err, data) {
    if (err) return reject(err);

    return resolve(data.Item);
  });
});

/**
 * Put sample token in database
 * @param id
 * @param token
 */
const putSampleToken = (id, token) => new Promise((resolve, reject) => {
  console.log('putSampleToken()');
  const item = {
    id,
    token,
  };
  const params = {
    TableName: SAMPLE_TOKEN_TABLE,
    Item: item,
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.put(params, err => {
    if (err) return reject(err);

    return resolve(item);
  });
});

/**
 * Get samples from database
 * @param id
 */
const getSamples = id => new Promise((resolve, reject) => {
  console.log('getSamples()');
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
  console.log('putSample()');
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
  getSampleToken,
  putSample,
  putSampleToken,
};
