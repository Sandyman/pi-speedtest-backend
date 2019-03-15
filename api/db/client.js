const AWS = require('aws-sdk');

const dbClient = new AWS.DynamoDB.DocumentClient();

const dbDelete = (params) => new Promise((resolve, reject) => {
  dbClient.delete(params, (err, data) => (err ? reject(err) : resolve(data)));
});

const get = (params) => new Promise((resolve, reject) => {
  dbClient.get(params, (err, data) => (err ? reject(err) : resolve(data)));
});

const put = (params) => new Promise((resolve, reject) => {
  dbClient.put(params, (err, data) => (err ? reject(err) : resolve(data)));
});

const query = (params) => new Promise((resolve, reject) => {
  dbClient.query(params, (err, data) => (err ? reject(err) : resolve(data)));
});

module.exports = {
  delete: dbDelete,
  get,
  put,
  query,
};
