export default class Windows {
  static init() {
    this.windowCount = 0;
    this.windowIds = {};
    chrome.windows.onRemoved.addListener(windowId => {
      this.closeWindow(windowId, {code: -1});
    });
  }

  static closeWindow(windowId, data, forceClose=false) {
    const windowData = this.windowIds[windowId];
    if (windowData) {
      delete this.windowIds[windowId];
      if (forceClose) {
        chrome.windows.remove(windowId);
      }
      chrome.browserAction.setIcon({
        path : '../icons/metahub-128.png'
      });
      if (typeof windowData.callback == 'function') {        setTimeout(() => windowData.callback(data), 1);
      }
      this.windowCount--;
    }
  }

  static createWindow(type, width, height, params, callback) {    chrome.windows.create({
      url: 'pages/window.html#/' + type,
      width: width,
      height: height,
      left: Math.round((screen.width - width) / 2),
      top: Math.round((screen.height * 0.8 - height) / 2),
      type: 'popup'
    }, (window) => {      this.windowCount++;
      chrome.browserAction.setIcon({
        path : '../icons/metahub-open.png'
      });
      this.windowIds[window.id] = { callback, params };
    });
  }

  static getParams() {
    return new Promise((resolve, reject) => {
      chrome.windows.getCurrent((window) => {
        const windowId = window.id;
        const windowData = this.windowIds[windowId];
        resolve(windowData ? windowData.params : null);
      });
    });
  }

  static getCount() {
    return this.windowCount;
  }

  static returnMessage(data, code=0) {
    chrome.windows.getCurrent((window) => {
      this.closeWindow(window.id, {code, data}, true);
    })
  }

}

Windows.init();