const crypto = require('crypto');

/**
 * Decrypt
 */
const decode = (secret, s) => {
  const iv = s.slice(0, 16);
  const encrypted = s.slice(16);
  const decrypt = crypto.createDecipher('aes256', Buffer.from(secret), iv);
  let decrypted = decrypt.update(encrypted, 'hex', 'utf8');
  decrypted += decrypt.final();
  return decrypted;
};

/**
 * Encrypt
 * @param secret
 * @param s
 */
const encode = (secret, s) => {
  const iv = crypto.randomBytes(8).toString('hex');
  const encrypt = crypto.createCipher('aes256', Buffer.from(secret), iv);
  let encrypted = encrypt.update(s, 'utf8', 'hex');
  encrypted += encrypt.final('hex');
  return iv + encrypted;
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
