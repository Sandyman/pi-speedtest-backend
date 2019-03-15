const moment = require('moment');

const client = require('./client');

const ACCESS_TOKEN_TABLE = process.env.ACCESS_TOKEN_TABLE;
const SAMPLE_TABLE = process.env.SAMPLE_TABLE;
const SAMPLE_TOKEN_TABLE = process.env.SAMPLE_TOKEN_TABLE;
const USER_TABLE = process.env.USER_TABLE;

/**
 * Get access token from table
 * @param id
 */
const getAccessToken = async (id) => {
  console.log('getAccessToken()');
  const params = {
    TableName: ACCESS_TOKEN_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  const data = await client.get(params);
  return data.Item;
};

const getLastSample = async (id) => {
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
  const data = await client.query(params);
  return data.Items[0];
};

/**
 * Get samples from database
 * @param id
 */
const getSamples = async (id) => {
  console.log('getSamples()');
  const params = {
    TableName: SAMPLE_TABLE,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  const data = await client.query(params);
  return data.Items;
};

/**
 * Get sample token
 * @param id
 */
const getSampleToken = async (id) => {
  console.log('getSampleToken()');
  const params = {
    TableName: SAMPLE_TOKEN_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  const data = await client.get(params);
  return data.Item;
};

/**
 * Get user based on Id
 * @param id
 */
const getUser = async (id) => {
  const params = {
    TableName: USER_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  const data = await client.get(params);
  return data.Item;
};

/**
 * Put access token in table
 * @param item
 */
const putAccessToken = async (item) => {
  const params = {
    TableName: ACCESS_TOKEN_TABLE,
    Item: item,
  };
  console.log(JSON.stringify(params, null, 3));
  await client.put(params);
  return item;
};

/**
 * Put sample in database
 * @param id
 * @param sample
 */
const putSample = async (id, sample) => {
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
  await client.put(params);
};

/**
 * Put sample token in database
 * @param id
 * @param token
 * @param hash
 */
const putSampleToken = async (id, token, hash) => {
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
  await client.put(params);
  return item;
};

/**
 * Create or update user in database table
 * @param item
 */
const putUser = async (item) => {
  const params = {
    TableName: USER_TABLE,
    Item: item,
  };
  console.log(JSON.stringify(params, null, 3));
  await client.put(params);
  return item;
};

/**
 * Delete access token from table
 * @param id
 */
const removeAccessToken = async (id) => {
  const params = {
    TableName: ACCESS_TOKEN_TABLE,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  await client.delete(params);
};

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
