class Sample {
  constructor({ timestamp, sample }) {
    const { speeds, client, server } = sample;
    this.timestamp = timestamp;
    this.upload = speeds.upload;
    this.download = speeds.download;
    this.ping = server.ping;
    this.location = server.location;
    this.country = server.country;
    this.cc = server.cc;
    this.isp = client.isp;
  }
}

class SampleToken {
  constructor({ token, status }) {
    this.contents = token;
    this.status = status || 'EXISTING';
  }
}

module.exports = {
  Sample,
  SampleToken,
};
