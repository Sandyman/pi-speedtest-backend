class UserInfo {
  constructor({ id, email, fullname, avatarUrl, username }) {
    this.id = id;
    this.email = email;
    this.fullname = fullname;
    this.avatarUrl = avatarUrl;
    this.username = username;
  }
}

module.exports = {
  UserInfo,
};
