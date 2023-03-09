
export default class MessageCenter {
  static msgId = 0;
  static msgMap = {};

  static watch() {
    document.addEventListener('chromeMessageResponse', (event) => {
      const data = event.detail;
      const callback = this.msgMap[data.id];
      delete this.msgMap[data.id];
      callback(data.response);
    });
  }

  static send(msg, callback) {
    var msgId = ++this.msgId;
    this.msgMap[msgId] = callback
    document.dispatchEvent(new CustomEvent("chromeMessageRequest", {detail: {id: msgId, msg: JSON.stringify(msg)}}));
  }

}

MessageCenter.watch();