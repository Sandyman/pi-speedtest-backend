const request = require('request');

const accessUri = 'https://github.com/login/oauth/access_token';
const userUri = 'https://api.github.com/user';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

/**
 * Request access token
 * @param code
 * @param state
 */
const requestAccessToken = (code, state) => new Promise((resolve, reject) => {
  const uri = [
    `${accessUri}`,
    `?client_id=${clientId}`,
    `&client_secret=${clientSecret}`,
    `&code=${code}`,
    `&state=${state}`,
  ].join('');

  const options = {
    uri,
    json: true,
  };
  console.log(JSON.stringify(options, null, 2));
  return request.post(options, (err, response, body) => {
    if (err) return reject(err);
    if (response.statusCode && response.statusCode !== 200) {
      console.log(`Error: ${response.statusCode}: ${response.statusMessage}`);
      return reject(new Error(response.statusMessage));
    }

    return resolve(body);
  });
});

/**
 * Request user object
 * @param accessToken
 */
const requestUserObject = accessToken => new Promise((resolve, reject) => {
  const options = {
    uri: userUri,
    headers: {
      Authorization: `Token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'api.pi-speedtest.net',
    },
    json: true,
  };
  console.log(JSON.stringify(options, null, 2));
  return request.get(options, (err, response, body) => {
    if (err) return reject(err);
    if (response.statusCode && response.statusCode !== 200) {
      console.log(JSON.stringify(body, null, 3));
      console.log(`Error: ${response.statusCode}: ${response.statusMessage}`);
      return reject(new Error(response.statusMessage));
    }

    console.log(JSON.stringify(body, null, 3));
    return resolve(body);
  })
});

module.exports = {
  requestAccessToken,
  requestUserObject,
};
