const AWS = require('aws-sdk');
const moment = require('moment');

const dbClient = new AWS.DynamoDB.DocumentClient();

const ACCESS_TOKEN_TABLE = process.env.ACCESS_TOKEN_TABLE;
const SAMPLE_TABLE = process.env.SAMPLE_TABLE;
const SAMPLE_TOKEN_TABLE = process.env.SAMPLE_TOKEN_TABLE;
const USER_TABLE = process.env.USER_TABLE;

/**
 * Get access token from table
 * @param id
 */
const getAccessToken = id => new Promise((resolve, reject) => {
  console.log('getAccessToken()');
  const params = {
    TableName: ACCESS_TOKEN_TABLE,
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

const getLastSample = (id) => new Promise((resolve, reject) => {
  console.log('getLastSample()');
  const params = {
    TableName: SAMPLE_TABLE,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    },
    Limit: 1,
    ScanIndexForward: false,
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.query(params, function(err, data) {
    if (err) return reject(err);

    return resolve(data.Items[0]);
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
 * Get user based on Id
 * @param id
 */
const getUser = id => new Promise((resolve, reject) => {
  const params = {
    TableName: USER_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.get(params, (err, data) => {
    if (err) return reject(err);

    return resolve(data.Item);
  });
});

/**
 * Put access token in table
 * @param item
 */
const putAccessToken = (item) => new Promise((resolve, reject) => {
  const params = {
    TableName: ACCESS_TOKEN_TABLE,
    Item: item,
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.put(params, (err, data) => {
    if (err) return reject(err);

    return resolve(item);
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

/**
 * Put sample token in database
 * @param id
 * @param token
 * @param hash
 */
const putSampleToken = (id, token, hash) => new Promise((resolve, reject) => {
  console.log('putSampleToken()');
  const item = {
    id,
    token,
    hash,
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
 * Create or update user in database table
 * @param item
 */
const putUser = (item) => new Promise((resolve, reject) => {
  const params = {
    TableName: USER_TABLE,
    Item: item,
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.put(params, (err, data) => {
    if (err) return reject(err);

    return resolve(item);
  });
});

/**
 * Delete access token from table
 * @param id
 */
const removeAccessToken = id => new Promise((resolve, reject) => {
  const params = {
    TableName: ACCESS_TOKEN_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.delete(params, (err, data) => {
    if (err) return reject(err);

    return resolve();
  });
});

module.exports = {
  getAccessToken,
  getLastSample,
  getSamples,
  getSampleToken,
  getUser,
  putAccessToken,
  putSample,
  putSampleToken,
  putUser,
  removeAccessToken,
};
