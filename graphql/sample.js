class Sample {
  constructor({ sample }) {
    const { speeds, client, server } = sample;
    this.upload = speeds.upload;
    this.download = speeds.download;
    this.ping = server.ping;
    this.location = server.location;
    this.country = server.country;
    this.cc = server.cc;
    this.isp = client.isp;
  }
}

module.exports = Sample;
