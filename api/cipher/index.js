const crypto = require('crypto');

/**
 * Decrypt
 */
const decode = (secret, s) => {
  const decrypt = crypto.createDecipher('aes256', new Buffer(secret));
  let decrypted = decrypt.update(s, 'hex', 'utf8');
  decrypted += decrypt.final();
  return decrypted;
};

/**
 * Encrypt
 * @param secret
 * @param s
 */
const encode = (secret, s) => {
  const encrypt = crypto.createCipher('aes256', new Buffer(secret));
  let encrypted = encrypt.update(s, 'utf8', 'hex');
  encrypted += encrypt.final('hex');
  return encrypted;
};

/**
 * Hash function
 * @returns {string}
 */
const hash = () => Math.random().toString(36).substring(2, 8).toUpperCase();

module.exports = {
  decode,
  encode,
  hash,
};
