const AWS = require('aws-sdk');

const dbClient = new AWS.DynamoDB.DocumentClient();

const ACCESS_TOKEN_TABLE = process.env.ACCESS_TOKEN_TABLE;
const SAMPLE_TABLE = process.env.SAMPLE_TABLE;
const SAMPLE_TOKEN_TABLE = process.env.SAMPLE_TOKEN_TABLE;
const USER_TABLE = process.env.USER_TABLE;

/**
 * Create delete request
 * @param key
 * @param hash
 */
const deleteRequest = (key, hash) => {
  const request = {
    DeleteRequest: {
      Key: {
        id: key,
      },
    },
  };
  if (hash) {
    request.DeleteRequest.Key['created'] = hash;
  }
  return request;
};

/**
 * Delete the simple tables.
 * @param sub
 */
const deleteSimpleTables = (sub) => new Promise((resolve, reject) => {
  const params = {
    RequestItems: {},
  };
  const _deleteRequest = deleteRequest(sub);

  params.RequestItems[SAMPLE_TOKEN_TABLE] = [ _deleteRequest ];
  params.RequestItems[ACCESS_TOKEN_TABLE] = [ _deleteRequest ];
  params.RequestItems[USER_TABLE] = [ _deleteRequest ];
  console.log(JSON.stringify(params, null, 3));
  return dbClient.batchWrite(params, (err) => {
    if (err) return reject(err);

    return resolve();
  });
});

/**
 * Delete the complex table
 * @param sub
 */
const deleteComplexTable = (sub) => new Promise((resolve, reject) => {
  const params = {
    TableName: SAMPLE_TABLE,
    KeyConditionExpression: 'id = :sub',
    ExpressionAttributeValues: {
      ':sub': sub,
    },
  };
  console.log(JSON.stringify(params, null, 3));
  return dbClient.query(params, (err, data) => {
    if (err) return reject(err);

    const items = data.Items;
    const sortKeys = items.map(item => item.created);
    const deleteRequests = sortKeys.map(sortKey => deleteRequest(sub, sortKey));
    const params2 = {
      RequestItems: {
        [SAMPLE_TABLE]: deleteRequests,
      },
      ReturnConsumedCapacity: 'TOTAL',
    };
    console.log(JSON.stringify(params2, null, 3));
    return dbClient.batchWrite(params2, (err, data) => {
      if (err) return reject(err);

      console.log(JSON.stringify(data.ConsumedCapacity, null, 3));
      return resolve();
    });
  })
});

/**
 * Delete everything related to a user account
 * @param event
 * @param context
 * @param callback
 */
const cleanup = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const { Message } = event.Records[0].Sns;
  const { sub } = JSON.parse(Message);

  return Promise.all([
    deleteSimpleTables(sub),
    deleteComplexTable(sub),
  ])
    .then(() => callback(null, 'OK'))
    .catch(err => {
      console.log(err);
      return callback(null, 'OK');
    });
};

module.exports = {
  cleanup,
};
