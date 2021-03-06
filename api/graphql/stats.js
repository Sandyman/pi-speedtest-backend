const mean = ar => ((ar.length > 0) ? ar.reduce((a, c) => (a + c), 0) / ar.length : 0);
const variance = (ar, avg) => mean(ar.map(n => Math.pow(n - avg, 2)));

const compact = field => ar => {
  console.log(ar);
  console.log(field);
  const iv = [];
  return ar.reduce((a, c) => {
    a.push(c[field]);
    return a;
  }, iv);
};

class Stat {
  constructor(samples) {
    console.log(samples);
    this.min = Math.min(...samples);
    this.max = Math.max(...samples);
    this.mean = mean(samples);
    this.var = variance(samples, this.mean);
    this.std = Math.sqrt(this.var);
  }
}

class Stats {
  constructor(samples) {
    this.download = new Stat(compact('download')(samples));
    this.upload = new Stat(compact('upload')(samples));
    this.ping = new Stat(compact('ping')(samples));
  }
}

module.exports = {
  Stats,
};
