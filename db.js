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

module.exports = {
  putSample,
};
