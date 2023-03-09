import MessageCenter from './messageCenter';

const strippedHost = () => {
  let host = location.hostname;

  // Replacing www. only if the domain starts with it.
  if(host.indexOf('www.') === 0) host = host.replace('www.', '');

  return host;
};

export default class Message {

  constructor() {
    this.type = '';
    this.payload = {};
  }

  static placeholder() { return new Message(); }
  static fromJson(json) { return Object.assign(this.placeholder(), json); }

  static payload(type, payload) {
    let p = this.placeholder();
    p.type = type;
    p.payload = payload;
    return p;
  }

  static signal(type) {
    let p = this.placeholder();
    p.type = type;
    return p;
  }

  request() {
    const msg = this;
    if (!msg.payload.domain) {
      msg.payload.domain = strippedHost();
    }
    return new Promise((resolve, reject) => {
      MessageCenter.send(msg, (response) => {
        resolve(response)
      });
    });
    
  }

  
}
